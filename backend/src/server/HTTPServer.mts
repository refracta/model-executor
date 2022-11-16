import express, {Application} from 'express';
import * as http from "http";

type Server = http.Server;

interface HTTPHandler {
    initRoute: (server: HTTPServer) => void,
}

class HTTPServer {
    public readonly app: Application;
    public readonly server: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
    }

    public callHandler(httpHandler: HTTPHandler) {
        httpHandler.initRoute(this);
    }

    public listen(port: number) {
        this.server.listen(port, () => {
            console.log(`HTTPServer Listening on ${port}.`);
        });
    }
}

export default HTTPServer;