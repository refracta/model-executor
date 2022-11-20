import net from 'net';
import * as fs from "fs";

let [host, port, modelPath] = process.argv.slice(2);
modelPath = Buffer.from(modelPath, 'base64').toString('utf8');
let socket = net.connect({port: parseInt(port), host});


socket.on('connect', function () {
    let socketData: any = {};
    socket.write(JSON.stringify({msg: 'launch', modelPath}));

    socket.on('data', function (data: Buffer) {
        console.log(data.length);
        if (socketData.mode !== 'file') {
            let message = JSON.parse(data.toString());
            if (message.msg === 'mode') {
                console.log(message);
                socketData.mode = message.type;
                socketData.filePath = message.filePath;
                socket.write(JSON.stringify({msg: 'wait'}));

                let writeStream = fs.createWriteStream(socketData.filePath);
                socket.pipe(writeStream, {end: false});
                socket.on('data', (data: Buffer) => {
                    let check = data[data.length - 1];
                    if (check == 26) {
                        socket.unpipe(writeStream);
                        writeStream.close();
                        delete socketData.mode;
                        delete socketData.filePath;
                        console.log('done!');
                        socket.write(JSON.stringify({msg: 'hello!'}));
                    }
                });
            }
        }
    });
});