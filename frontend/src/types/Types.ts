import {JsonValue, SendJsonMessage, SendMessage, WebSocketLike} from 'react-use-websocket/dist/lib/types';

import {Dispatch, SetStateAction} from "react";
import {ReadyState} from "react-use-websocket/src/lib/constants";

type ConfigData = {
    name: string;
    explain: string;
    container: string;
    input: { module: string, options: any };
    output: { module: string, options: any };
}

type HistoryData = {
    modelPath: string;
    inputPath?: string;
    inputInfo?: any;
    outputPath?: string;
    outputInfo?: any;
    description?: string;
    terminal?: string;
    time?: Date;
}

type ModelData = {
    path: string;
    hierarchy: string[];
    name: string;
    uniqueName: string;
    config?: ConfigData;
    lastHistory?: HistoryData;
    status: string;
}

type AppData = {
    model: ModelData | null;
    setModel: Dispatch<SetStateAction<ModelData | null>>;
    models: ModelData[];
    setModels: Dispatch<SetStateAction<ModelData[]>>;
    sendMessage: SendMessage;
    sendJsonMessage: SendJsonMessage;
    lastMessage: MessageEvent<any> | null;
    lastJsonMessage: JsonValue | null;
    readyState: ReadyState;
    getWebSocket: () => (WebSocketLike | null)
}

export type {ModelData, ConfigData, HistoryData, AppData};