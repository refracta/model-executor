import {ISocket} from "../types/Types.mjs";
import SocketServer from "../SocketServer.mjs";
import PlatformServer from "../core/PlatformServer.mjs";
import Model from "../../Model.mjs";
import Database from "../../Database.mjs";
import * as fs from "fs";

class SocketHandler {
    public onReady(server: SocketServer, socket: ISocket) {

    }

    public async onData(server: SocketServer, socket: ISocket, data: Buffer) {
        if (socket.data.mode !== 'file') {
            let message = JSON.parse(data.toString());
            if (message.msg === 'launch') {
                socket.data.modelPath = message.modelPath;
                socket.write(JSON.stringify({msg: 'mode', type: 'file', filePath: '/opt/mctr/i/raw'}));
            } else if (message.msg === 'wait'){
                let model = Model.getModel(socket.data.modelPath);
                let history = model.lastHistory;

                let readStream = fs.createReadStream(history.inputPath as string);
                readStream.pipe(socket, {end: false});
                readStream.on('end', ()=>{
                    readStream.close();
                    let eofBuffer = Buffer.from([26]);
                    socket.write(eofBuffer);
                });
            } else {
                console.log(message);
            }
        }
    }

    public onClose(server: SocketServer, socket: ISocket, hadError: boolean) {

    }
}

export default SocketHandler;