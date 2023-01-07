import PlatformServer from "../../core/PlatformServer";
import Model from "../../../Model";
import {Terminal} from "xterm-headless";
import {SerializeAddon} from "xterm-addon-serialize";
import {v4 as uuid} from "uuid";
import {SocketHandler} from "../../../types/Interfaces";
import {DefaultSocket, DefaultSocketServer, SocketMessageType, SocketReceiveMode} from "../../../types/Types";

type Handle = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => void;
let handles: { [messageType: string]: Handle } = {};

handles[SocketMessageType.Launch] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.modelPath = message.modelPath;
    let model = Model.getModel(socket.data.modelPath);
    let history = model.lastHistory;
    (async () => {
        await server.manager.sendFile(socket, history.inputPath as string, '/opt/mctr/i/raw');
        await server.manager.sendTextAsFile(socket, JSON.stringify({
            input: history.inputInfo,
            parameters: {}
        }), '/opt/mctr/i/info');
        socket.data.terminal = new Terminal({allowProposedApi: true});
        socket.data.terminalSerializer = new SerializeAddon();
        socket.data.terminal.loadAddon(socket.data.terminalSerializer);
        socket.write(JSON.stringify({msg: 'LaunchModel'}));
    })();
}

handles[SocketMessageType.FileWait] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.readStream.pipe(socket, {end: false});
    socket.data.readStream.on('end', () => {
        socket.data.readStream?.close?.();
    });
}

handles[SocketMessageType.FileReceiveEnd] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.fileSendResolver();
}

handles[SocketMessageType.Terminal] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.terminalBuffer += message.data;
    if (socket.data.waitTerminalFlushTimeout) {
        return;
    }
    socket.data.waitTerminalFlushTimeout = true;
    setTimeout(() => {
        let model = Model.getModel(socket.data.modelPath);
        let history = model.lastHistory;
        socket.data.terminal.write(socket.data.terminalBuffer, () => {
            history.terminal = socket.data.terminalSerializer.serialize();
            model.lastHistory = history;
        });
        let sockets = PlatformServer.wsServer.manager.getModelSockets(model);
        PlatformServer.wsServer.manager.sendTerminal(socket.data.terminalBuffer, sockets);

        console.log('Buffer flushed:', socket.data.terminalBuffer.length);
        socket.data.terminalBuffer = '';
        socket.data.waitTerminalFlushTimeout = false;
    }, 100);
}

handles[SocketMessageType.ProcessEnd] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    let model = Model.getModel(socket.data.modelPath);
    let history = model.lastHistory;
    history.outputPath = 'resources/' + uuid();
    (async () => {
        await server.manager.getFile(socket, history.outputPath as string, '/opt/mctr/o/raw');
        history.description = await server.manager.getFileAsText(socket, '/opt/mctr/o/desc');
        history.outputPath = '/' + history.outputPath;
        model.lastHistory = history;
        let sockets = PlatformServer.wsServer.manager.getModelSockets(model);
        PlatformServer.wsServer.manager.sendUpdateModel(model, sockets);
    })();
}

handles[SocketMessageType.File] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.receiveMode = SocketReceiveMode.FILE;
    socket.data.fileSize = message.fileSize;
    socket.data.receivedBytes = 0;
    socket.pipe(socket.data.writeStream);
    server.manager.json({msg: SocketMessageType.WaitReceive}, [socket]);
}

export default class DefaultSocketHandler implements SocketHandler<DefaultSocketServer, DefaultSocket> {
    onReady(server: DefaultSocketServer, socket: DefaultSocket) {
        socket.data.buffer = '';
        socket.data.receiveMode = SocketReceiveMode.JSON;
        socket.data.waitTerminalFlushTimeout = false;
        socket.data.terminalBuffer = '';
    }

    onData(server: DefaultSocketServer, socket: DefaultSocket, data: Buffer) {
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
                handles[message.msg](server, socket, message);
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
                handles[message.msg](server, socket, message);
            }
        } else {
            socket.data.receivedBytes += data.length;
            if (socket.data.receivedBytes == socket.data.fileSize) {
                socket.unpipe(socket.data.writeStream);
                socket.data.writeStream.write(data, function () {
                    socket.data.writeStream?.destroy?.();
                });
                socket.resume();
                socket.data.receiveMode = SocketReceiveMode.JSON;
                server.manager.json({msg: SocketMessageType.FileReceiveEnd}, [socket]);
                socket.data.fileReceiveResolver();
            }
        }
    }


    onClose(server: DefaultSocketServer, socket: DefaultSocket, hadError: boolean) {

    }
}

