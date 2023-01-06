import express, {Application} from 'express';
import * as http from "http";
import {HTTPHandler} from "../types/Types";

type Server = http.Server;

export default class HTTPServer {
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