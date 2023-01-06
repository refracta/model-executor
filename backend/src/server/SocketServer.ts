import net, {Server, Socket, SocketAddress} from "net";
import {v4 as uuidv4} from "uuid";
import {ISocket} from "../types/Types";
import {SocketHandler} from "../types/Interfaces";
import SocketManager from "./sender/SocketManager";

export default class SocketServer<SocketData, Manager extends SocketManager> {
    public readonly server: Server;
    public readonly manager: Manager;
    public readonly sockets: (ISocket & { data: SocketData })[] = [];
    public readonly socketsMap: { [id: string]: ISocket & { data: SocketData } } = {};
    public readonly handlers: SocketHandler<any, any>[] = [];

    constructor(manager: Manager) {
        this.server = net.createServer(((socket: ISocket & { data: SocketData }) => {
            socket.id = uuidv4();
            socket.data = {} as SocketData;
            this.socketsMap[socket.id] = socket;
            this.sockets.push(socket);

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

    public addHandler(handler: SocketHandler<any, any>) {
        this.handlers.push(handler);
    }

    public removeHandler(handler: SocketHandler<any, any>) {
        let index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }

    public listen(port: number) {
        this.server.listen(port, function () {
            console.log(`SocketServer: Listening on ${port}.`);
        });
    }
}