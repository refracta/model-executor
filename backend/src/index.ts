import App from './App.mjs';
import Database from "./Database.mjs";
import WebSocket, { WebSocketServer } from "ws";
import {v4 as uuidv4} from 'uuid';
import * as http from 'http';

const app = new App().application;
const server = http.createServer(app).listen(5000, () => {
    console.log('Server listening on port 5000');
});

let ws = new WebSocketServer({
    server, path: "/",
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});

ws.on("connection", (socket: any, req) => {
    socket.id = uuidv4();

    socket.on("message", (message: string) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Error JSON Parsing:', message.length, message);
        }
    });

    socket.on("error", (error: Error) => {
        socket.close();
    });

    socket.on("close", () => {

    });
});