export default class ServerSocketManager<Server> {
    protected server?: Server;

    public init(server: Server) {
        this.server = server;
    }
}