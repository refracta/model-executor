import express, {Application} from "express";
import * as http from "http";
import {HTTPHandler} from "../types/Interfaces";

type Server = http.Server;

export default class HTTPServer {
    readonly app: Application;
    readonly server: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
    }

    callHandler(httpHandler: HTTPHandler) {
        httpHandler.initRoute(this);
    }

    listen(port: number) {
        this.server.listen(port, () => {
            console.log(`HTTPServer Listening on ${port}.`);
        });
    }
}