import {Socket as NetSocket} from "net";
import {WebSocket} from "ws";
import WSServer from "../server/WSServer";
import SocketServer from "../server/SocketServer";
import HTTPServer from "../server/HTTPServer";
import DefaultSocketManager from "../server/impl/manager/DefaultSocketManager";
import DefaultWSManager from "../server/impl/manager/DefaultWSManager";
import stream from "stream";
import {Terminal} from "xterm-headless";
import {SerializeAddon} from "xterm-addon-serialize";



export type ISocket = NetSocket & { id: string };
type Resolver = (value?: unknown) => void;
type ReadStreamClose = (callback?: (err?: NodeJS.ErrnoException | null) => void) => void;
export type DefaultSocketData = {
    buffer: string,
    receiveMode: SocketReceiveMode,
    receivedBytes: number,
    fileSize: number,
    writeStream: stream.Writable,
    readStream: stream.Readable & { close?: ReadStreamClose },
    fileReceiveResolver: Resolver,
    fileSendResolver: Resolver,
    modelPath: string,
    terminal: Terminal,
    terminalSerializer: SerializeAddon
};

export type DefaultSocket = ISocket & { data: DefaultSocketData };
export type IWSocket = WebSocket & { id: string, req: any };
export type DefaultWSData = {
    modelUniqueName?: string;
    path: string
};
export type DefaultWSocket = IWSocket & { data: DefaultWSData };

export type DefaultSocketServer = SocketServer<DefaultSocketData, DefaultSocketManager>;
export type DefaultWSServer = WSServer<DefaultWSData, DefaultWSManager>;

export enum SocketMessageType {
    Hello = 'Hello',
    Launch = 'Launch',
    FileWait = 'FileWait',
    FileReceiveEnd = 'FileReceiveEnd',
    Terminal = 'Terminal',
    ProcessEnd = 'ProcessEnd',
    File = 'File',
    RequestFile = 'RequestFile',
    WaitReceive = 'WaitReceive'
}

export enum WSMessageType {
    Path = 'Path',
    TerminalResize = 'TerminalResize',
    UpdateModel = 'UpdateModel',
    UpdateModels = 'UpdateModels'
}

export enum SocketReceiveMode {
    JSON,
    FILE
}


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