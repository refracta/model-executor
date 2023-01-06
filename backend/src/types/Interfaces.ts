import {RawData} from "ws";

export interface SocketHandler<Server, Socket> {
    onReady?: (server: Server, socket: Socket) => void,
    onData?: (server: Server, socket: Socket, data: Buffer) => void,
    onClose?: (server: Server, socket: Socket, hadError: boolean) => void,
}

export interface WebSocketHandler<Server, Socket> {
    onReady?: (server: Server, socket: Socket) => void,
    onMessage?: (server: Server, socket: Socket, message: RawData, isBinary: boolean) => void,
    onClose?: (server: Server, socket: Socket, code: number, reason: Buffer) => void,
}