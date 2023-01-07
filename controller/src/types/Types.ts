import {Socket} from "net";
import * as stream from "stream";
import SocketClient from "../client/SocketClient";
import DefaultSocketManager from "../client/impl/manager/DefaultSocketManager";
import {IPty} from "node-pty-prebuilt-multiarch";


export type DefaultSocketClient = SocketClient<DefaultSocketData, DefaultSocketManager>;

type Resolver = (value?: unknown) => void;
type ReadStreamClose = (callback?: (err?: NodeJS.ErrnoException | null) => void) => void;
export type DefaultSocketData = {
    ptyProcess: IPty;
    filePath: string;
    buffer: string;
    receiveMode: SocketReceiveMode;
    receivedBytes: number;
    fileSize: number;
    writeStream: stream.Writable;
    readStream: stream.Readable & { close?: ReadStreamClose };
};
export type DefaultSocket = Socket & { data: DefaultSocketData };

export enum SocketMessageType {
    Hello = 'Hello',
    Launch = 'Launch',
    FileWait = 'FileWait',
    FileReceiveEnd = 'FileReceiveEnd',
    Terminal = 'Terminal',
    ProcessEnd = 'ProcessEnd',
    File = 'File',
    RequestFile = 'RequestFile',
    LaunchModel = 'LaunchModel',
    TerminalResize = 'TerminalResize',
    WaitReceive = 'WaitReceive'
}


export enum SocketReceiveMode {
    JSON,
    FILE
}

