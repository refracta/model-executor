import {SocketHandler} from "../../../types/Interfaces";
import {DefaultSocket, DefaultSocketClient, SocketMessageType, SocketReceiveMode} from "../../../types/Types";
import fs from "fs";
import pty from "node-pty-prebuilt-multiarch";

type Handle = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => void;
let handles: { [messageType: string]: Handle } = {};

handles[SocketMessageType.File] = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => {
    socket.data.fileSize = message.fileSize;
    if (socket.data.fileSize === 0) {
        return;
    }
    socket.data.receiveMode = SocketReceiveMode.FILE;
    socket.data.filePath = message.filePath;
    socket.data.receivedBytes = 0;
    socket.data.writeStream = fs.createWriteStream(socket.data.filePath)
    socket.pipe(socket.data.writeStream);
    client.manager.sendFileWait();
}

handles[SocketMessageType.LaunchModel] = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => {
    let ptyProcess = pty.spawn('bash', ['/opt/mctr/run'], {
        name: 'xterm-color',
        cols: 181,
        rows: 14,
        cwd: process.env.HOME,
        env: process.env as { [key: string]: string }
    });
    // WARNING: Hard-coded cols, rows

    ptyProcess.onData((data) => {
        client.manager.sendTerminal(data);
    });

    ptyProcess.onExit((e) => {
        client.manager.sendProcessEnd();
    });
}

handles[SocketMessageType.TerminalResize] = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => {
    socket.data.ptyProcess.resize(message.cols, message.rows);
}

handles[SocketMessageType.RequestFile] = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => {
    console.log('RequestFile: ' + JSON.stringify(message));
    let fileSize = fs.statSync(message.filePath).size;
    socket.data.readStream = fs.createReadStream(message.filePath);
    client.manager.sendFile(fileSize);
}

handles[SocketMessageType.WaitReceive] = (client: DefaultSocketClient, socket: DefaultSocket, message: any) => {
    console.log('WaitReceive');
    socket.data.readStream.pipe(socket, {end: false});
    socket.data.readStream.on('end', () => {
        socket.data.readStream?.close?.();
    });
}
export default class DefaultSocketHandler implements SocketHandler<DefaultSocketClient, DefaultSocket> {

    constructor(public modelPath: string) {
    }

    onReady(client: DefaultSocketClient, socket: DefaultSocket): void {
        socket.data.buffer = '';
        socket.data.receiveMode = SocketReceiveMode.JSON;
        client.manager.sendLaunch(this.modelPath);
    }

    onData(client: DefaultSocketClient, socket: DefaultSocket, data: Buffer): void {
        if (socket.data.receiveMode === SocketReceiveMode.JSON) {
            let dataString = socket.data.buffer + data.toString();
            let splitString = dataString.split('\0').filter(s => s.length > 0);
            let lastMessageString = splitString.pop() as string;
            for (let split of splitString) {
                let message;
                try {
                    message = JSON.parse(split);
                } catch (e) {
                    console.error(e);
                    console.error(`split.length=${split.length}, dataString.length=${dataString.length}`);
                    console.error(`split=${JSON.stringify(split)}, dataString=${JSON.stringify(dataString)}`);
                    process.exit(1);
                }
                console.log('DefaultSocketHandler.onMessage', message);
                handles[message.msg](client, socket, message);
            }
            let message;
            try {
                message = JSON.parse(lastMessageString);
                socket.data.buffer = '';
            } catch (e) {
                socket.data.buffer = lastMessageString;
            }
            if (message) {
                console.log('DefaultSocketHandler.onMessage', message);
                handles[message.msg](client, socket, message);
            }
        } else {
            socket.data.receivedBytes += data.length;
            if (socket.data.receivedBytes == socket.data.fileSize) {
                socket.unpipe(socket.data.writeStream);
                socket.data.writeStream.write(data, () => {
                    socket.data.writeStream?.destroy?.();
                });
                socket.resume();
                socket.data.receiveMode = SocketReceiveMode.JSON;
                client.manager.json({msg: SocketMessageType.FileReceiveEnd});
                // socket.data.fileReceiveResolver();
            }
        }
    }

    onClose(client: DefaultSocketClient, socket: DefaultSocket, hadError: boolean): void {
    }

}