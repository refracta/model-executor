import SocketManager from "../../sender/SocketManager";
import {DefaultSocket, SocketMessageType} from "../../../types/Types";
import Model from "../../../Model";
import fs from "fs";
import stream from "stream";
import streams from "memory-streams";

export default class DefaultSocketManager extends SocketManager {

    public getAllSockets() {
        return this.server?.sockets as DefaultSocket[];
    }

    public getModelSocket(model: Model) {
        return this.server?.sockets.find((s) => s.data.path === model.path) as DefaultSocket;
    }

    public json(data: any, sockets: DefaultSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.write(JSON.stringify(data)));
    }

    public sendHello(sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.Hello}, sockets);
    }

    public async sendFile(socket: DefaultSocket, localPath: string, filePath: string) {
        let fileSize = fs.statSync(localPath).size;
        this.json({msg: SocketMessageType.File, filePath, fileSize}, [socket]);
        socket.data.readStream = fs.createReadStream(localPath);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    public async sendTextAsFile(socket: DefaultSocket, text: string, filePath: string) {
        let fileSize = Buffer.byteLength(text, 'utf8');
        this.json({msg: SocketMessageType.File, filePath, fileSize}, [socket]);
        socket.data.readStream = stream.Readable.from([text]);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    public async getFile(socket: DefaultSocket, localPath: string, remotePath: string) {
        socket.data.writeStream = fs.createWriteStream(localPath);
        this.json({msg: SocketMessageType.RequestFile, filePath: remotePath}, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
    }

    public async getFileAsText(socket: DefaultSocket, remotePath: string) {
        socket.data.writeStream = new streams.WritableStream();
        this.json({msg: SocketMessageType.RequestFile, filePath: remotePath}, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
        return socket.data.writeStream.toString();
    }
}