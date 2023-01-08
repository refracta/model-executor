import React, {CSSProperties} from 'react';
import {Card} from 'react-bootstrap';
import {ModelData} from "../../../types/Types";

const img: CSSProperties = {
    maxWidth: '100%',
};

export default function SingleImageViewer({model}: { model: ModelData }) {
    let config = model?.config;
    let outputPath = model.lastHistory?.outputPath;
    return (<>
        <Card.Text>Output format: {config!.output.options.format.join(', ')}</Card.Text>
        {outputPath ? <img style={img} src={outputPath}/> : <></>}
    </>);
}
