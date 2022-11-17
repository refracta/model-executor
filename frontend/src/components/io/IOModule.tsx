import React from 'react';
import GeneralSinglePhotoViewer from "./output/GeneralSinglePhotoViewer";
import GeneralSingleFileUploader from "./input/GeneralSingleFileUploader";

let modules = [GeneralSinglePhotoViewer, GeneralSingleFileUploader];

function IOModule({name}: { name: string }) {
    let Module = modules.find(m => m.name === name) as () => JSX.Element;
    return (<Module></Module>);
}

export default IOModule;