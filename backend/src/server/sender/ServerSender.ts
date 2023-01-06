import WSServer from "../WSServer";

export default class ServerSender<T> {
    protected server?: T;

    public init(server: T) {
        this.server = server;
    }
}