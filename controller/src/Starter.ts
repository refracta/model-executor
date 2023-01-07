import SocketClient from "./client/SocketClient";
import {DefaultSocketData} from "./types/Types";
import DefaultSocketManager from "./client/impl/manager/DefaultSocketManager";
import DefaultSocketHandler from "./client/impl/handler/DefaultSocketHandler";

let [host, port, modelPath] = process.argv.slice(2);
modelPath = Buffer.from(modelPath, 'base64').toString('utf8');

let socketClient = new SocketClient<DefaultSocketData, DefaultSocketManager>({
    host,
    port: parseInt(port)
}, new DefaultSocketManager());
socketClient.addHandler(new DefaultSocketHandler(modelPath));