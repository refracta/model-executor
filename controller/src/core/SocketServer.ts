import net, {NetConnectOpts, Server, Socket, SocketAddress} from "net";
import {v4 as uuidv4} from "uuid";
import {ISocket} from "../types/Types";
import {SocketHandler} from "../types/Interfaces";
import SocketManager from "./sender/SocketManager";

export default class SocketClient<SocketData, Manager extends SocketManager> {
    readonly socket: Socket;
    readonly manager: Manager;
    readonly handlers: SocketHandler<any, any>[] = [];

    constructor(options:NetConnectOpts, manager: Manager) {
        this.socket = net.connect(options);

        this.socket.on('')

        this.socket = net.createServer(((socket: Socket & { data: SocketData }) => {
            socket.data = {} as SocketData;

            let addressInfo = socket.address() as SocketAddress;
            console.log('SocketServer: ' + addressInfo.address + ' connected.');

            this.handlers.forEach(h => h.onReady?.(this, socket));

            socket.on('data', (data: Buffer) => {
                this.handlers.forEach(h => h.onData?.(this, socket, data));
            });

            socket.on('error', (err: Error) => {
                socket.destroy();
            });

            socket.on('close', (hadError: boolean) => {
                this.handlers.forEach(h => h.onClose?.(this, socket, hadError));
                this.sockets.splice(this.sockets.indexOf(socket), 1);
                delete this.socketsMap[socket.id as string];
            });
        }) as (socket: Socket) => void);

        this.server.on('error', function (err) {
            console.error('SocketServer Error:' + err);
        });

        this.manager = manager;
        this.manager.init(this);
    }

    addHandler(handler: SocketHandler<any, any>) {
        this.handlers.push(handler);
    }

    removeHandler(handler: SocketHandler<any, any>) {
        let index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }
}