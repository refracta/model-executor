import HTTPServer from "../HTTPServer";
import fs from "fs";
import {DefaultSocketServer, DefaultWSServer} from "../../types/Types";

export default class PlatformServer {
    private static instance: PlatformServer;
    public static httpServer: HTTPServer;
    public static wsServer: DefaultWSServer;
    public static socketServer: DefaultSocketServer;
    public static config: any;

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public static init(params: { httpServer: HTTPServer, wsServer: DefaultWSServer, socketServer: DefaultSocketServer}) {
        this.httpServer = params.httpServer;
        this.wsServer = params.wsServer;
        this.socketServer = params.socketServer;
        this.loadConfig();
    }

    public static loadConfig() {
        if (!fs.existsSync('config.json')) {
            fs.writeFileSync('config.json', JSON.stringify({
                httpPort: 0,
                socketExternalHost: '',
                socketPort: 0,
                defaultDockerServer: {host: '', port: 0}
            }), 'utf8');
        }
        PlatformServer.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    }
}

