import {Socket, Socket as NetSocket} from "net";
import * as stream from "stream";


type Resolver = (value?: unknown) => void;
type ReadStreamClose = (callback?: (err?: NodeJS.ErrnoException | null) => void) => void;
export type SocketData = {
    buffer: string,
    receiveMode: SocketReceiveMode,
    receivedBytes: number,
    fileSize: number,
    writeStream: stream.Writable,
    readStream: stream.Readable & { close?: ReadStreamClose },
    fileReceiveResolver: Resolver,
    fileSendResolver: Resolver,
    modelPath: string,
};
export type ClientSocket = Socket & { data: SocketData };

export enum SocketMessageType {
    Hello = 'Hello',
    Launch = 'Launch',
    FileWait = 'FileWait',
    FileReceiveEnd = 'FileReceiveEnd',
    Terminal = 'Terminal',
    ProcessEnd = 'ProcessEnd',
    File = 'File',
    RequestFile = 'RequestFile'
}


export enum SocketReceiveMode {
    JSON,
    FILE
}

