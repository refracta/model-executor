import {v4 as uuidv4} from 'uuid';
import {AddressInfo, WebSocketServer, WebSocket, ServerOptions, RawData} from 'ws';
import {SocketAddress} from "net";

type IWSSocket = WebSocket & { id?: string, data?: any, req?: any };

interface WebSocketHandler {
    onOpen?: (server: WSServer, socket: IWSSocket) => void,
    onMessage?: (server: WSServer, socket: IWSSocket, message: RawData, isBinary: boolean) => void,
    onClose?: (server: WSServer, socket: IWSSocket, code: number, reason: Buffer) => void,
}

class WSServer {
    public readonly server: WebSocketServer;
    public readonly sockets: IWSSocket[] = [];
    public readonly socketsMap: { [id: string]: IWSSocket } = {};
    public readonly handlers: WebSocketHandler[] = [];

    constructor(options: ServerOptions) {
        this.server = new WebSocketServer(options);
        this.server.on('connection', (socket: IWSSocket, req) => {
            socket.id = uuidv4();
            socket.req = req;
            this.socketsMap[socket.id as string] = socket;
            this.sockets.push(socket);

            let address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            console.log('WebSocketServer: ' + address + " connected.");

            socket.on('open', () => {
                this.handlers.forEach(h => h.onOpen?.(this, socket));
            });

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
    }

    public addHandler(handler: WebSocketHandler) {
        this.handlers.push(handler);
    }

    public removeHandler(handler: WebSocketHandler) {
        let index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }
}

export default WSServer;

