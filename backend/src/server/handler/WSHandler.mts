import {RawData} from "ws";
import WSServer from "../WSServer.mjs";
import {IWSSocket} from "../types/Types.mjs";

class WSHandler {
    public onReady(server: WSServer, socket: IWSSocket) {
        console.log('onReady')
        socket.send(JSON.stringify({msg:'hello'}));
    }

    public onMessage(server: WSServer, socket: IWSSocket, message: RawData, isBinary: boolean) {
        let data = JSON.parse(message.toString());
        console.log(data);
        if (data.msg === 'path') {
            socket.data.path = data.path;
        }
    }

    public onClose(server: WSServer, socket: IWSSocket, code: number, reason: Buffer) {
    }
}

export default WSHandler;