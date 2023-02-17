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
                httpPort: 5000,
                socketExternalHost: '',
                socketPort: 5050,
                defaultDockerServer: {host: '', port: 0}
            }), 'utf8');
        }
        PlatformServer.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    }

    static listen() {
        this.httpServer.listen(this.config.httpPort);
        this.socketServer.listen(this.config.socketPort);
    }

    static close() {
        this.httpServer.close();
        this.socketServer.close();
    }

    static getDockerServer(dockerServer:any) {
        return dockerServer ? this.config.dockerServers[dockerServer] : this.config.dockerServers[this.config.defaultDockerServer];
    }
}

