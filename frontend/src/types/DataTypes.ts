import {Dispatch, SetStateAction} from "react";


type ConfigData = {
    name: string,
    explain: string,
    container: string
    input: { module: string, options: any },
    output: { module: string, options: any }
}

type ModelData = {
    path: string,
    hierarchy: string[],
    name: string,
    uniqueName: string,
    config?: ConfigData,
    status: string
}

type AppData = {
    model: ModelData | null,
    setModel: Dispatch<SetStateAction<ModelData | null>>
    models: ModelData[]
    setModels: Dispatch<SetStateAction<ModelData[]>>
}

export type {ModelData, ConfigData, AppData};