type ConfigData = {
    name: string,
    explain: string,
    container: string
    input: { [index: string]: string },
    output: { [index: string]: string }
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