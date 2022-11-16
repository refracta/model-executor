import App from './App.mjs';
import Database from "./Database.mjs";
import WebSocket, {AddressInfo, WebSocketServer} from "ws";
import {v4 as uuidv4} from 'uuid';
import * as http from 'http';
import Docker, {ContainerInfo, Exec} from 'dockerode';
import * as fs from "fs";
import tar from 'tar';
import net from 'net';


let netServer = net.createServer(function(socket){
    console.log((socket.address() as AddressInfo).address + " connected.");

    // client로 부터 오는 data를 화면에 출력
    socket.on('data', function(data){
        console.log('rcv:' + data);
    });
    // client와 접속이 끊기는 메시지 출력
    socket.on('close', function(){
        console.log('client disconnted.');
    });
    // client가 접속하면 화면에 출력해주는 메시지
    socket.write('welcome to server');
});

// 에러가 발생할 경우 화면에 에러메시지 출력
netServer.on('error', function(err){
    console.log('err'+ err	);
});

// Port 5000으로 접속이 가능하도록 대기
netServer.listen(6000, function(){
    console.log('linsteing on 5000..');
});

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
            file: 'controller.tar'
        },
        ['controller-linux']
    );
    await container.putArchive('controller.tar', {path: '/'});
        container.exec({
                Cmd: ['/bin/bash', '-c', 'chmod 777 controller-linux && ./controller-linux'],
                AttachStdin: true,
                AttachStdout: true
            }, function (err, exec) {
                (exec as Exec).start({hijack: true, stdin: true}, function (err, stream) {
                    docker.modem.demuxStream(stream as any, process.stdout, process.stderr);
                });
            });
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