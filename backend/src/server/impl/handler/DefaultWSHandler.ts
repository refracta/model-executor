import {RawData} from "ws";
import {DefaultWSocket, DefaultWSServer, WSMessageType} from "../../../types/Types";
import Model from "../../../Model";
import PlatformServer from "../../core/PlatformServer";
import {WebSocketHandler} from "../../../types/Interfaces";

type Handle = (server: DefaultWSServer, socket: DefaultWSocket, data: any) => void;
let handles: { [messageType: string]: Handle } = {};

// TODO: Front-side Refactoring
handles[WSMessageType.Path] = (server: DefaultWSServer, socket: DefaultWSocket, message: any) => {
    socket.data.path = message.path;
    delete socket.data.modelUniqueName;
    if (socket.data.path.startsWith('model/')) {
        let modelUniqueName = socket.data.path.split('/').pop() as string;
        if (Model.getModel(modelUniqueName)) {
            socket.data.modelUniqueName = socket.data.path.split('/').pop() as string;
        }
    }
}

handles[WSMessageType.TerminalResize] = (server: DefaultWSServer, socket: DefaultWSocket, message: any) => {
    if (!socket.data.modelUniqueName) {
        return;
    }

    let model = Model.getModel(socket.data.modelUniqueName);
    let modelSocket = PlatformServer.socketServer.manager.getModelSocket(model);
    if (modelSocket) {
        PlatformServer.socketServer.manager.json(message, [modelSocket]);
        // WARNING: Data checking 필요
    }
}

export default class DefaultWSHandler implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {
    public onReady(server: DefaultWSServer, socket: DefaultWSocket) {
        PlatformServer.socketServer.manager.sendHello();
    }

    public onMessage(server: DefaultWSServer, socket: DefaultWSocket, message: RawData, isBinary: boolean) {
        let data = JSON.parse(message.toString());
        console.log('DefaultWSHandler.onMessage', data);
        handles[data.msg](server, socket, data);
    }

    public onClose(server: DefaultWSServer, socket: DefaultWSocket, code: number, reason: Buffer) {
    }
}

