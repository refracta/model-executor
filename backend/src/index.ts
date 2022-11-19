import HTTPServer from "./server/HTTPServer.mjs";
import SocketServer from "./server/SocketServer.mjs";
import WSServer from "./server/WSServer.mjs";
import HTTPHandler from "./server/handler/HTTPHandler.mjs";
import PlatformServer from "./server/core/PlatformServer.mjs";
import * as fs from "fs";
import WSHandler from "./server/handler/WSHandler.mjs";

if (!fs.existsSync('config.json')) {
    fs.writeFileSync('config.json', JSON.stringify({httpPort: 5000, socketPort: 5050}), 'utf8');
}
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const httpServer: HTTPServer = new HTTPServer();
const wsServer: WSServer = new WSServer({
    server: httpServer.server, path: "/websocket",
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
const socketServer: SocketServer = new SocketServer();


PlatformServer.init({httpServer, wsServer, socketServer});
httpServer.callHandler(new HTTPHandler());
wsServer.addHandler(new WSHandler());


httpServer.listen(config.httpPort);
socketServer.listen(config.socketPort);