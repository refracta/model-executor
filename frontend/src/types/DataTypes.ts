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
    config: ConfigData,
    status: string
}

export type {ModelData, ConfigData};