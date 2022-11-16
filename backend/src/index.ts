import App from './App.mjs';
import Database from "./Database.mjs";
import WebSocket, {WebSocketServer} from "ws";
import {v4 as uuidv4} from 'uuid';
import * as http from 'http';
import Docker, {ContainerInfo, Exec} from 'dockerode';
import * as fs from "fs";
import tar from 'tar';

let docker = new Docker({host: 'abstr.net', port: 30001});
!async function () {
    let containers = await docker.listContainers();
    let containerInfo = containers.find(c => c.Names.some(n => n.includes('/test'))) as ContainerInfo;
    let container = docker.getContainer(containerInfo.Id);
    /*    container.exec({
            Cmd: ['/bin/bash', '-c', 'base64 -d > testrun'],
            AttachStdin: true,
            AttachStdout: true
        }, function (err, exec) {
            (exec as Exec).start({hijack: true, stdin: true}, function (err, stream) {
                fs.createReadStream('cc', 'base64').pipe(stream as any);
                docker.modem.demuxStream(stream as any, process.stdout, process.stderr);
            });
        });*/
    console.log('exec');
    await tar.c(
        {
            gzip: true,
            file: 'my-tarball.tgz'
        },
        ['db.json', 'yarn.lock']
    );
    await container.putArchive('my-tarball.tgz', {path: '/'});

    // console.log(container);
}();

const app = new App().application;
const server = http.createServer(app).listen(5000, () => {
    console.log('Server listening on port 5000');
});

let ws = new WebSocketServer({
    server, path: "/websocket",
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

ws.on("connection", (socket, req) => {
    let socketObject = socket as any;
    socketObject.id = uuidv4();
    socket.send('Hello!!');

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