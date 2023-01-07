export interface SocketHandler<Client, Socket> {
    onReady?: (client: Client, socket: Socket) => void,
    onData?: (client: Client, socket: Socket, data: Buffer) => void,
    onClose?: (client: Client, socket: Socket, hadError: boolean) => void,
}
