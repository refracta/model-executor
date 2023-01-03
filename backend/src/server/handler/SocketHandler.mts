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
import model from "../../Model.mjs";
import {v4 as uuid} from "uuid";
import streams from 'memory-streams';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class SocketHandler {
    public onReady(server: SocketServer, socket: ISocket) {
        socket.data.buffer = '';
        socket.data.count = 0;
        socket.data.lcount = 0;
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

    private async getFile(socket: ISocket, localPath: string, remotePath: string) {
        socket.data.writeStream = fs.createWriteStream(localPath);
        socket.write(JSON.stringify({msg: 'RequestFile', filePath: remotePath}));
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
    }

    private async getFileAsText(socket: ISocket, remotePath: string) {
        socket.data.writeStream = new streams.WritableStream();
        socket.write(JSON.stringify({msg: 'RequestFile', filePath: remotePath}));
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
        return socket.data.writeStream.toString();
    }


    public onData(server: SocketServer, socket: ISocket, data: Buffer) {
        if (socket.data.mode !== 'file') {
            let dataString = socket.data.buffer + data.toString();
            let splitString = dataString.split('\0').filter(s => s.length > 0);
            let messageString;
            if (splitString.length > 1) {
                let last = splitString.pop() as string;
                for (let split of splitString) {
                    try {
                        this.onMessage(server, socket, JSON.parse(split));
                    } catch (e) {
                        console.error(e);
                        console.error();
                        console.error(split.length, dataString.length);
                        console.error(split);
                        console.error(dataString);
                        process.exit(1);
                    }
                }
                try {
                    this.onMessage(server, socket, JSON.parse(last));
                    socket.data.buffer = '';
                } catch (e) {
                    socket.data.buffer = last;
                }
            } else {
                messageString = splitString[0];
                try {
                    this.onMessage(server, socket, JSON.parse(messageString));
                    socket.data.buffer = '';
                } catch (e) {
                    socket.data.buffer = messageString;
                }
            }
        } else {
            socket.data.received += data.length;
            if (socket.data.received == socket.data.fileSize) {
                socket.unpipe(socket.data.writeStream);
                socket.data.writeStream.write(data, function () {
                    socket.data.writeStream?.destroy?.();
                });

                socket.resume();
                delete socket.data.mode;
                delete socket.data.fileSize;
                socket.write(JSON.stringify({msg: 'FileReceiveEnd'}));
                socket.data.fileReceiveResolver(void 0);
            }
            /*            else {
                            console.log(data.length, 'receive');
                        }*/
        }
    }

    public onMessage(server: SocketServer, socket: ISocket, message: any) {
        if (message.msg === 'Launch') {
            socket.data.modelPath = message.modelPath;
            let model = Model.getModel(socket.data.modelPath);
            let history = model.lastHistory;
            (async () => {
                await this.sendFile(socket, history.inputPath as string, '/opt/mctr/i/raw');
                await this.sendTextAsFile(socket, JSON.stringify({
                    input: history.inputInfo,
                    parameters: {}
                }), '/opt/mctr/i/info');
                socket.data.terminal = new Terminal({allowProposedApi: true});
                socket.data.terminalSerializer = new SerializeAddon();
                socket.data.terminal.loadAddon(socket.data.terminalSerializer);
                socket.write(JSON.stringify({msg: 'LaunchModel'}));
            })();
        } else if (message.msg === 'FileWait') {
            socket.data.readStream.pipe(socket, {end: false});
            socket.data.readStream.on('end', () => {
                socket.data.readStream?.close?.();
            });
        } else if (message.msg === 'FileReceiveEnd') {
            socket.data.fileSendResolver(void 0);
        } else if (message.msg === 'Terminal') {
            let model = Model.getModel(socket.data.modelPath);
            let modelUniqueName = Model.uniqueNameMap[model.path];
            let history = model.lastHistory;
            socket.data.terminal.write(message.data, () => {
                history.terminal = socket.data.terminalSerializer.serialize();
                model.lastHistory = history;
            });
            PlatformServer.wsServer.sockets.filter(s => s.data.path?.startsWith(`model/${modelUniqueName}`)).forEach(s => s.send(JSON.stringify(message)));
        } else if (message.msg === 'ProcessEnd') {
            let model = Model.getModel(socket.data.modelPath);
            let modelUniqueName = Model.uniqueNameMap[model.path];
            let history = model.lastHistory;
            history.outputPath = 'resources/' + uuid();
            (async () => {
                await this.getFile(socket, history.outputPath as string, '/opt/mctr/o/raw');
                history.description = await this.getFileAsText(socket, '/opt/mctr/o/desc');
                history.outputPath = '/' + history.outputPath;
                model.lastHistory = history;

                PlatformServer.wsServer.sockets.filter(s => s.data.path?.startsWith(`model/${modelUniqueName}`)).forEach(s => s.send(JSON.stringify({
                    msg: 'UpdateModel',
                    model: model.toFullData()
                })));
            })();
        } else if (message.msg === 'File') {
            socket.data.mode = 'file';
            socket.data.fileSize = message.fileSize;
            socket.data.received = 0;
            socket.pipe(socket.data.writeStream);
            socket.write(JSON.stringify({msg: 'WaitReceive'}));
        }
    }

    public onClose(server: SocketServer, socket: ISocket, hadError: boolean) {

    }
}

export default SocketHandler;