import {ISocket} from "../types/Types.mjs";
import SocketServer from "../SocketServer.mjs";
import PlatformServer from "../core/PlatformServer.mjs";
import Model from "../../Model.mjs";
import Database from "../../Database.mjs";
import * as fs from "fs";
import * as stream from "stream";

class SocketHandler {
    public onReady(server: SocketServer, socket: ISocket) {

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
            let message = JSON.parse(data.toString());
            if (message.msg === 'Launch') {
                socket.data.modelPath = message.modelPath;
                let model = Model.getModel(socket.data.modelPath);
                let history = model.lastHistory;
                await this.sendFile(socket, history.inputPath as string, '/opt/mctr/i/raw');
                await this.sendTextAsFile(socket, JSON.stringify({
                    input: history.inputInfo,
                    parameters: {}
                }), '/opt/mctr/i/info');
            } else if (message.msg === 'FileWait') {
                socket.data.readStream.pipe(socket, {end: false});
                socket.data.readStream.on('end', () => {
                    socket.data.readStream?.close?.();
                });
            } else if (message.msg === 'FileReceiveEnd') {
                console.log(message);
                socket.data.fileSendResolver(void 0);
            }
        }
    }

    public onClose(server: SocketServer, socket: ISocket, hadError: boolean) {

    }
}

export default SocketHandler;