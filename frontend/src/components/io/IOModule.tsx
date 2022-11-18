import React from 'react';
import GeneralSinglePhotoViewer from "./output/GeneralSinglePhotoViewer";
import GeneralSingleFileUploader from "./input/GeneralSingleFileUploader";
import {ModelData} from "../../types/DataTypes";

let modules = [GeneralSinglePhotoViewer, GeneralSingleFileUploader];

function IOModule({moduleName, model}: { moduleName: string, model: ModelData }) {
    let Module = modules.find(m => m.name === moduleName) as (props: { model: ModelData }) => JSX.Element;
    return (<Module model={model}></Module>);
}

export default IOModule;