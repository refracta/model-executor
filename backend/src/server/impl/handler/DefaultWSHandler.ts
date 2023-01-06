import {RawData} from "ws";
import WSServer from "../../WSServer";
import {DefaultWSData, DefaultWSServer, ISocket, IWSocket} from "../../../types/Types";
import Model from "../../../Model";
import PlatformServer from "../../core/PlatformServer";
import {WebSocketHandler} from "../../../types/Interfaces";
import DefaultWSSender from "../sender/DefaultWSSender";

export default class DefaultWSHandler implements WebSocketHandler<DefaultWSServer, DefaultWSData> {
    public onReady(server: DefaultWSServer, socket: DefaultWSData) {
        console.log('onReady')
        socket.send(JSON.stringify({msg: 'hello'}));
    }

    public onMessage(server: DefaultWSServer, socket: DefaultWSData, message: RawData, isBinary: boolean) {
        let data = JSON.parse(message.toString());
        console.log(data);
        if (data.msg === 'path') {
            socket.data.path = data.path;
        } else if (data.msg === 'TerminalResize') {
            let model = Model.modelMap[socket.data.path.split('/').pop()];
            PlatformServer.socketServer.sockets.find((s: DefaultWSData) => s.data?.path === model.path)?.write(JSON.stringify(data));
        }
    }

    public onClose(server: DefaultWSServer, socket: DefaultWSData, code: number, reason: Buffer) {
    }
}

