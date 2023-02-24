import React, {CSSProperties} from 'react';
import {Button, Card} from 'react-bootstrap';
import {AppProps, ModelStatus} from "../../../../types/Types";
import {FileUtils} from "../../../../utils/FileUtils";
import {DownloadUtils} from "../../../../utils/DownloadUtils";

const img: CSSProperties = {
    maxWidth: '100%',
};

function renderModelView({context}: AppProps) {
    let model = context.model;
    let config = model?.config;
    let history = model?.lastHistory;
    let outputPath = model?.lastHistory?.outputPath;
    let outputName = model?.lastHistory?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;
    let outputExtensions = config!.output?.options?.format?.join(', ');
    outputExtensions = outputExtensions ? outputExtensions : 'image';

    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output {outputPath ?
                <span className="badge green">Last executed</span> : ''}</Card.Title>
            {outputPath && fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    DownloadUtils.download('/' + outputPath, outputName);
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body>
            <Card.Text>Output format: {outputExtensions}
                <br/>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                </> : <></>}
            </Card.Text>
            {outputPath ? <img style={img} src={'/' + outputPath}/> : <></>}
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    let outputPath = history?.outputPath;
    let outputName = history?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;
    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output</Card.Title>
            {fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    DownloadUtils.download('/' + outputPath, outputName);
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body>
            <Card.Text>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                </> : <></>}
            </Card.Text>
            {context.history?.modelStatus === ModelStatus.OFF ?
                <img style={img} src={'/' + history?.outputPath}/> : <></>}
        </Card.Body>
    </>;
}

export default function SingleImageViewer(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}