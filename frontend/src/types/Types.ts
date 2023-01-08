import {JsonValue, SendJsonMessage, SendMessage, WebSocketLike} from 'react-use-websocket/dist/lib/types';

import {Dispatch, SetStateAction} from "react";
import {ReadyState} from "react-use-websocket/src/lib/constants";

export type ConfigData = {
    name: string;
    explain: string;
    container: string;
    input: { module: string, options: any, form: { schema: any, uischema: any, data: any } };
    output: { module: string, options: any };
}

export type HistoryData = {
    modelPath: string;
    inputPath?: string;
    inputInfo?: any;
    outputPath?: string;
    outputInfo?: any;
    description?: string;
    terminal?: string;
    time?: Date;
}

export type ModelData = {
    path: string;
    hierarchy: string[];
    name: string;
    configName: string;
    uniqueName: string;
    config?: ConfigData;
    lastHistory?: HistoryData;
    status: string;
}

export type AppData = {
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