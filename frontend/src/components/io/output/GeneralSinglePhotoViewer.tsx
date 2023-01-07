import React, {CSSProperties} from 'react';
import {Card} from 'react-bootstrap';
import {ModelData} from "../../../types/Types";

const img: CSSProperties = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

function GeneralSinglePhotoViewer({model}: { model: ModelData }) {
    let config = model?.config;
    let outputPath = model.lastHistory?.outputPath;
    return (<><Card.Text>
        Output format: {config!.output.options.format.join(', ')}
        {outputPath ? <img style={img} src={outputPath}/> : <></>}
    </Card.Text></>);
}

export default GeneralSinglePhotoViewer;