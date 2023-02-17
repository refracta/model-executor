import React from 'react';
import {AppProps} from "../../../types/Types";
import SingleInputUploader from "./input/SingleInputUploader";
import EmptyInputUploader from "./input/EmptyInputUploader";

let modules = [EmptyInputUploader, SingleInputUploader];

export default function InputModule({context}: AppProps) {
    let model = context.model;
    let history = context.history;
    let target = context.path.startsWith('model') ? model?.config?.input.module : history?.inputModule;
    let Module = modules.find(m => m.name === target) as (props: AppProps) => JSX.Element;
    if (Module) {
        return <Module context={context}/>;
    } else {
        return <></>;
    }
}
