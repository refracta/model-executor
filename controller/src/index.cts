import net from 'net';
import * as fs from "fs";

let [host, port, modelPath] = process.argv.slice(2);
modelPath = Buffer.from(modelPath, 'base64').toString('utf8');
let socket = net.connect({port: parseInt(port), host});

let received = 0;
let writeStream: fs.WriteStream;
let reserveUnpipe = false;

socket.on('connect', function () {
    let socketData: any = {};
    socket.write(JSON.stringify({msg: 'Launch', modelPath}));

    socket.on('data', function (data: Buffer) {
        if (socketData.mode !== 'file') {
            let message = JSON.parse(data.toString());
            if (message.msg === 'File') {
                console.log(message);
                socketData.mode = 'file';
                socketData.filePath = message.filePath;
                socketData.fileSize = message.fileSize;
                socket.write(JSON.stringify({msg: 'FileWait'}));
                received = 0;
                writeStream = fs.createWriteStream(socketData.filePath);
                socket.pipe(writeStream);
            } else {
                console.log(message);
            }
        } else {
            received += data.length;
            if (received == socketData.fileSize) {
                socket.unpipe(writeStream);
                writeStream.write(data);
                writeStream.destroy();
                socket.resume();
                console.log('File receive done!', socketData);
                delete socketData.mode;
                delete socketData.filePath;
                delete socketData.fileSize;
                socket.write(JSON.stringify({msg: 'FileReceiveEnd'}));
            }
        }
    });
});