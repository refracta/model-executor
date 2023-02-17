import {JsonValue, SendJsonMessage, SendMessage, WebSocketLike} from 'react-use-websocket/dist/lib/types';

import {Dispatch, SetStateAction} from "react";
import {ReadyState} from "react-use-websocket/src/lib/constants";

export type ConfigData = {
    name: string;
    explain: string;
    container: string;
    input: { module: string, options?: any, parameters?: { schema: any, uischema: any, data: any } };
    output: { module: string, options?: any };
}

export type HistoryData = {
    number?: number;
    modelName: string;
    modelExplain: string;
    modelPath: string;
    inputPath?: string;
    inputInfo?: any;
    parameters?: any;
    outputPath?: string;
    outputInfo?: any;
    description?: string;
    terminal?: string;
    inputModule?: string;
    outputModule?: string;
    modelStatus?: string;
    time?: string;
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

export type AppContext = {
    model: ModelData | null;
    setModel: Dispatch<SetStateAction<ModelData | null>>;
    models: ModelData[];
    setModels: Dispatch<SetStateAction<ModelData[]>>;
    history: HistoryData | null;
    setHistory: Dispatch<SetStateAction<HistoryData | null>>;
    histories: HistoryData[];
    setHistories: Dispatch<SetStateAction<HistoryData[]>>;
    parameters: any;
    setParameters: Dispatch<SetStateAction<any>>;
    sendMessage: SendMessage;
    sendJsonMessage: SendJsonMessage;
    lastMessage: MessageEvent<any> | null;
    lastJsonMessage: JsonValue | null;
    readyState: ReadyState;
    getWebSocket: () => (WebSocketLike | null);
    path: string;
}

export type AppProps = {
    context: AppContext
}

export enum ModelStatus {
    DEPLOYING = 'deploying',
    UNDEPLOYING = 'undeploying',
    RUNNING = 'running',
    ERROR = 'error',
    OFF = 'off',
}

export enum WSMessageType {
    Path = 'Path',
    TerminalResize = 'TerminalResize',
    Terminal = 'Terminal',
    UpdateModel = 'UpdateModel',
    UpdateModels = 'UpdateModels',
    UpdateHistory = 'UpdateHistory',
    UpdateHistories = 'UpdateHistories'
}