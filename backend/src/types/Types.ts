import {Socket as NetSocket} from "net";
import {RawData, WebSocket} from "ws";
import WSServer from "../server/WSServer";
import SocketServer from "../server/SocketServer";
import HTTPServer from "../server/HTTPServer";
import DefaultSocketSender from "../server/impl/sender/DefaultSocketSender";
import DefaultWSSender from "../server/impl/sender/DefaultWSSender";

export interface HTTPHandler {
    initRoute: (server: HTTPServer) => void,
}

export type ISocket = NetSocket & { id: string };
export type DefaultSocketData = any;
export type DefaultSocket = ISocket & {data : DefaultSocketData};
export type IWSocket = WebSocket & { id: string, req: any };
export type DefaultWSData = any;
export type DefaultWSocket = IWSocket & {data : DefaultWSData};

export type DefaultSocketServer = SocketServer<DefaultSocketData, DefaultSocketSender>;
export type DefaultWSServer = WSServer<DefaultWSData, DefaultWSSender>;

export type ModelData = {
    status: string,
    historyIndex?: number
}
export type Models = {
    [index: string]: ModelData
}

export type HistoryData = {
    modelPath: string,
    inputPath?: string,
    inputInfo?: any,
    outputPath?: string,
    outputInfo?: any,
    description?: string,
    terminal?: string
    time?: Date
}

export type Data = {
    models: Models,
    histories: HistoryData[]
}