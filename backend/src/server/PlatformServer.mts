import HTTPServer from "./HTTPServer.mjs";
import SocketServer from "./SocketServer.mjs";
import WSServer from "./WSServer.mjs";

class PlatformServer {
    private static instance: PlatformServer;
    public static httpServer: HTTPServer;
    public static wsServer: WSServer;
    public static socketServer: SocketServer;

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public static init(params: { httpServer: HTTPServer, wsServer: WSServer, socketServer: SocketServer }) {
        this.httpServer = params.httpServer;
        this.wsServer = params.wsServer;
        this.socketServer = params.socketServer;
    }
}

export default PlatformServer;