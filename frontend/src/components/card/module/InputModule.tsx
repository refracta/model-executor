import React from 'react';
import SingleImageViewer from "./output/SingleImageViewer";
import SingleImageUploader from "./input/SingleImageUploader";
import {ModelData} from "../../../types/Types";

let modules = [SingleImageViewer, SingleImageUploader];

export default function InputModule({
                                     moduleName,
                                     model,
                                     parameters
                                 }: { moduleName: string, model: ModelData, parameters?: any }) {
    let Module = modules.find(m => m.name === moduleName) as (props: { model: ModelData, parameters?: any }) => JSX.Element;
    return (<Module model={model} parameters={parameters}></Module>);
}
