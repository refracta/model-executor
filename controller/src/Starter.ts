import SocketClient from "./core/SocketClient";

let [host, port, modelPath] = process.argv.slice(2);
modelPath = Buffer.from(modelPath, 'base64').toString('utf8');

let controller = new SocketClient(host, parseInt(port), modelPath);
controller.start();