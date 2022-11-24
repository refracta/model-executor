import net, {Server, Socket, SocketAddress} from 'net';
import {v4 as uuidv4} from 'uuid';
import {ISocket} from "./types/Types.mjs";

interface SocketHandler {
    onReady?: (server: SocketServer, socket: ISocket) => void,
    onData?: (server: SocketServer, socket: ISocket, data: Buffer) => void,
    onClose?: (server: SocketServer, socket: ISocket, hadError: boolean) => void,
}

class SocketServer {
    public readonly server: Server;
    public readonly sockets: ISocket[] = [];
    public readonly socketsMap: { [id: string]: ISocket } = {};
    public readonly handlers: SocketHandler[] = [];

    constructor() {
        this.server = net.createServer((socket: ISocket) => {
            socket.id = uuidv4();
            socket.data = {};
            this.socketsMap[socket.id] = socket;
            this.sockets.push(socket);

            let addressInfo = socket.address() as SocketAddress;
            console.log('SocketServer: ' + addressInfo.address + " connected.");

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
        });

        this.server.on('error', function (err) {
            console.error('SocketServer Error:' + err);
        });
    }

    public addHandler(handler: SocketHandler) {
        this.handlers.push(handler);
    }

    public removeHandler(handler: SocketHandler) {
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

export default SocketServer;