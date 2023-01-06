import SocketServer from "./server/SocketServer";
import WSServer from "./server/WSServer";
import DefaultHTTPHandler from "./server/impl/handler/DefaultHTTPHandler";
import PlatformServer from "./server/core/PlatformServer";
import DefaultWSHandler from "./server/impl/handler/DefaultWSHandler";
import DefaultSocketHandler from "./server/impl/handler/DefaultSocketHandler";
import DefaultWSSender from "./server/impl/sender/DefaultWSSender";
import DefaultSocketSender from "./server/impl/sender/DefaultSocketSender";
import {DefaultSocketServer, DefaultWSServer} from "./types/Types";
import HTTPServer from "./server/HTTPServer";

const httpServer: HTTPServer = new HTTPServer();
const wsServer: DefaultWSServer = new WSServer({
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
}, new DefaultWSSender());
const socketServer: DefaultSocketServer = new SocketServer(new DefaultSocketSender());

PlatformServer.init({httpServer, wsServer, socketServer});
httpServer.callHandler(new DefaultHTTPHandler());
wsServer.addHandler(new DefaultWSHandler());
socketServer.addHandler(new DefaultSocketHandler());

httpServer.listen(PlatformServer.config.httpPort);
socketServer.listen(PlatformServer.config.socketPort);