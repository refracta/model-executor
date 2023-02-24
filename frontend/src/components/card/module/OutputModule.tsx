import React from 'react';
import SingleImageViewer from "./output/SingleImageViewer";
import {AppProps} from "../../../types/Types";
import SingleTextViewer from "./output/SingleTextViewer";
import ZipGalleryViewer from "./output/ZipGalleryViewer";

let modules = [SingleImageViewer, SingleTextViewer, ZipGalleryViewer];

export default function OutputModule({context}: AppProps) {
    let model = context.model;
    let history = context.history;
    let target = context.path.startsWith('model') ? model?.config?.output.module : history?.outputModule;
    let Module = modules.find(m => m.name === target) as (props: AppProps) => JSX.Element;
    if (Module) {
        return <Module context={context}/>;
    } else {
        return <></>;
    }
}
