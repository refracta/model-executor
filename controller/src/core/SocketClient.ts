import net, {Socket} from "net";
import {ClientSocket, SocketData} from "../types/Types";

export default class SocketClient {
    socket?: ClientSocket;

    constructor(public host: string, public port: number, public modelPath: string) {
    }

    start() {
        this.socket = net.connect({host: this.host, port: this.port}) as ClientSocket;
        this.socket.data = {} as SocketData;

    }
}