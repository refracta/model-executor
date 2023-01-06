import {v4 as uuidv4} from "uuid";
import {RawData, ServerOptions, WebSocketServer} from "ws";
import {IWSocket} from "../types/Types";
import {WebSocketHandler} from "../types/Interfaces";
import WSManager from "./sender/WSManager";

export default class WSServer<SocketData, Manager extends WSManager> {
    public readonly server: WebSocketServer;
    public readonly manager: Manager;
    public readonly sockets: (IWSocket & { data: SocketData })[] = [];
    public readonly socketsMap: { [id: string]: IWSocket & { data: SocketData } } = {};
    public readonly handlers: WebSocketHandler<any, any>[] = [];

    constructor(options: ServerOptions, manager: Manager) {
        this.server = new WebSocketServer(options);
        this.server.on('connection', (socket: IWSocket & { data: SocketData }, req) => {
            socket.id = uuidv4();
            socket.req = req;
            socket.data = {} as SocketData;
            this.socketsMap[socket.id as string] = socket;
            this.sockets.push(socket);

            let address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            console.log('WebSocketServer: ' + address + ' connected.');

            this.handlers.forEach(h => h.onReady?.(this, socket));

            socket.on('message', (message: RawData, isBinary: boolean) => {
                this.handlers.forEach(h => h.onMessage?.(this, socket, message, isBinary));
            });

            socket.on('error', (error: Error) => {
                console.error('WebSocketServer Error: ' + address, error);
                socket.close();
            });

            socket.on('close', (code: number, reason: Buffer) => {
                this.handlers.forEach(h => h.onClose?.(this, socket, code, reason));
                this.sockets.splice(this.sockets.indexOf(socket), 1);
                delete this.socketsMap[socket.id as string];
            });
        });
        this.manager = manager;
        this.manager.init(this);
    }

    public addHandler(handler: WebSocketHandler<any, any>) {
        this.handlers.push(handler);
    }

    public removeHandler(handler: WebSocketHandler<any, any>) {
        let index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }
}
