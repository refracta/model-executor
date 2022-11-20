import HTTPServer from "../HTTPServer.mjs";
import SocketServer from "../SocketServer.mjs";
import WSServer from "../WSServer.mjs";
import Model from "../../Model.mjs";
import fs from "fs";

class PlatformServer {
    private static instance: PlatformServer;
    public static httpServer: HTTPServer;
    public static wsServer: WSServer;
    public static socketServer: SocketServer;
    public static config: any;

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public static init(params: { httpServer: HTTPServer, wsServer: WSServer, socketServer: SocketServer }) {
        this.httpServer = params.httpServer;
        this.wsServer = params.wsServer;
        this.socketServer = params.socketServer;
        this.loadConfig();
    }

    public static loadConfig(){
        if (!fs.existsSync('config.json')) {
            fs.writeFileSync('config.json', JSON.stringify({
                httpPort: 5000,
                socketExternalHost: 'h.abstr.net',
                socketPort: 5050,
                defaultDockerServer: {host: "abstr.net", port: 30001}
            }), 'utf8');
        }
        PlatformServer.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    }
}

export default PlatformServer;