import {ISocket} from "../types/Types.mjs";
import SocketServer from "../SocketServer.mjs";
import PlatformServer from "../core/PlatformServer.mjs";
import Model from "../../Model.mjs";
import Database from "../../Database.mjs";
import * as fs from "fs";
import * as stream from "stream";
import XTerm from 'xterm-headless';

const {Terminal} = XTerm;
import {SerializeAddon} from "xterm-addon-serialize";

class SocketHandler {
    public onReady(server: SocketServer, socket: ISocket) {
        socket.data.buffer = '';
    }

    private async sendFile(socket: ISocket, localPath: string, filePath: string) {
        let fileSize = fs.statSync(localPath).size;
        socket.write(JSON.stringify({msg: 'File', filePath, fileSize}));
        socket.data.readStream = fs.createReadStream(localPath);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    private async sendTextAsFile(socket: ISocket, text: string, filePath: string) {
        let fileSize = Buffer.byteLength(text, 'utf8');
        socket.write(JSON.stringify({msg: 'File', filePath, fileSize}));
        socket.data.readStream = stream.Readable.from([text]);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    public async onData(server: SocketServer, socket: ISocket, data: Buffer) {
        if (socket.data.mode !== 'File') {
            let dataString = socket.data.buffer + data.toString();
            let splitString = dataString.split('\0');
            let message:any;
            let messageString;
            if (splitString.length > 1) {
                for(let split of splitString){
                    await this.onData(server, socket, Buffer.from(split));
                }
                return;
            } else {
                messageString = splitString[0];
                try {
                    message = JSON.parse(messageString);
                } catch (e) {
                    socket.data.buffer = messageString;
                    return;
                }
            }

            if (message.msg === 'Launch') {
                socket.data.modelPath = message.modelPath;
                let model = Model.getModel(socket.data.modelPath);
                let history = model.lastHistory;
                await this.sendFile(socket, history.inputPath as string, '/opt/mctr/i/raw');
                await this.sendTextAsFile(socket, JSON.stringify({
                    input: history.inputInfo,
                    parameters: {}
                }), '/opt/mctr/i/info');

                socket.data.terminal = new Terminal({allowProposedApi: true});
                socket.data.terminalSerializer = new SerializeAddon();
                socket.data.terminal.loadAddon(socket.data.terminalSerializer);

                socket.write(JSON.stringify({msg: 'LaunchModel'}));
            } else if (message.msg === 'FileWait') {
                socket.data.readStream.pipe(socket, {end: false});
                socket.data.readStream.on('end', () => {
                    socket.data.readStream?.close?.();
                });
            } else if (message.msg === 'FileReceiveEnd') {
                console.log(message);
                socket.data.fileSendResolver(void 0);
            } else if (message.msg === 'Terminal') {
                let model = Model.getModel(socket.data.modelPath);
                let modelUniqueName = Model.uniqueNameMap[model.path];
                let history = model.lastHistory;
                socket.data.terminal.write(message.data);
                history.terminal = socket.data.terminalSerializer.serialize();
                model.lastHistory = history;

                PlatformServer.wsServer.sockets.filter(s => s.data.path?.startsWith(`model/${modelUniqueName}`)).forEach(s => s.send(JSON.stringify(message)));
            }
        }
    }

    public onClose(server: SocketServer, socket: ISocket, hadError: boolean) {

    }
}

export default SocketHandler;