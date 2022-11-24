import {RawData} from "ws";
import WSServer from "../WSServer.mjs";
import {IWSSocket} from "../types/Types.mjs";
import Model from "../../Model.mjs";
import PlatformServer from "../core/PlatformServer.mjs";

class WSHandler {
    public onReady(server: WSServer, socket: IWSSocket) {
        console.log('onReady')
        socket.send(JSON.stringify({msg: 'hello'}));
    }

    public onMessage(server: WSServer, socket: IWSSocket, message: RawData, isBinary: boolean) {
        let data = JSON.parse(message.toString());
        console.log(data);
        if (data.msg === 'path') {
            socket.data.path = data.path;
        } else if (data.msg === 'TerminalResize') {
            let model = Model.modelMap[socket.data.path.split('/').pop()];
            PlatformServer.socketServer.sockets.find(s => s.data?.path === model.path)?.write(JSON.stringify(data));
        }
    }

    public onClose(server: WSServer, socket: IWSSocket, code: number, reason: Buffer) {
    }
}

export default WSHandler;