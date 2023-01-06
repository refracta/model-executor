import HTTPServer from "../HTTPServer";
import fs from "fs";
import {DefaultSocketServer, DefaultWSServer} from "../../types/Types";

export default class PlatformServer {
    static httpServer: HTTPServer;
    static wsServer: DefaultWSServer;
    static socketServer: DefaultSocketServer;
    static config: any;
    private static instance: PlatformServer;

    static get Instance() {
        return this.instance || (this.instance = new this());
    }

    static init(params: { httpServer: HTTPServer, wsServer: DefaultWSServer, socketServer: DefaultSocketServer }) {
        this.httpServer = params.httpServer;
        this.wsServer = params.wsServer;
        this.socketServer = params.socketServer;
        this.loadConfig();
    }

    static loadConfig() {
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

