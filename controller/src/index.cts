import net from 'net';
import * as fs from "fs";
import * as pty from 'node-pty-prebuilt-multiarch';
// import * as pty from 'node-pty';

let [host, port, modelPath] = process.argv.slice(2);
modelPath = Buffer.from(modelPath, 'base64').toString('utf8');
let socket = net.connect({port: parseInt(port), host});

let received = 0;
let writeStream: fs.WriteStream;

socket.on('connect', function () {
    let socketData: any = {};
    socket.write(JSON.stringify({msg: 'Launch', modelPath}) + '\0');

    socket.on('data', function (data: Buffer) {
        if (socketData.mode !== 'file') {
            let message = JSON.parse(data.toString());
            if (message.msg === 'File') {
                console.log(message);
                socketData.mode = 'file';
                socketData.filePath = message.filePath;
                socketData.fileSize = message.fileSize;
                socket.write(JSON.stringify({msg: 'FileWait'}) + '\0');
                received = 0;
                writeStream = fs.createWriteStream(socketData.filePath);
                socket.pipe(writeStream);
            } else if (message.msg === 'LaunchModel') {
                let ptyProcess = pty.spawn('bash', [], {
                    name: 'xterm-color',
                    cols: 181,
                    rows: 14,
                    cwd: process.env.HOME,
                    env: process.env as { [key: string]: string }
                });

                ptyProcess.onData((data) => {
                    console.log(JSON.stringify({data}));
                    socket.write(JSON.stringify({msg: 'Terminal', data}) + '\0');
                });

                ptyProcess.write('ping h.abstr.net\r');
                socketData.ptyProcess = ptyProcess;
                // ptyProcess.write('ls\r');
            } else if (message.msg === 'TerminalResize') {
                socketData.ptyProcess.resize(message.cols, message.rows);
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
                socket.write(JSON.stringify({msg: 'FileReceiveEnd'}) + '\0');
            }
        }
    });
});