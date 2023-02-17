import React, {CSSProperties, useEffect, useState} from 'react';
import {Button, Card} from 'react-bootstrap';
import {AppProps} from "../../../../types/Types";
import {FileUtils} from "../../../../utils/FileUtils";

const img: CSSProperties = {
    maxWidth: '100%',
};

function download(dataURL: string, fileName: string) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = fileName;
    link.click();
}

function renderModelView({context}: AppProps) {
    let model = context.model;
    let history = model?.lastHistory;
    let outputPath = history?.outputPath;
    let outputName = model?.lastHistory?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;
    let [text, setText] = useState<string>('');

    useEffect(() => {
        if (outputPath && fileSize !== 0) {
            (async () => {
                let text = await fetch('/' + outputPath).then(r => r.text());
                setText(text);
            })();
        }
    }, [outputPath, fileSize]);

    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output {outputPath ?
                <span className="badge green">Last executed</span> : ''}</Card.Title>
            {outputPath && fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    download('/' + outputPath, outputName.endsWith('.txt') ? outputName : outputName + '.txt');
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body>
            <Card.Text>Output format: text
                <br/>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                    <br/>
                </> : <></>}
                <br/>
                {outputPath ? <>
                    <span style={{fontWeight: 'bold'}}>Output: </span>
                    <br/>
                    <span style={{whiteSpace: "pre-wrap"}}>{text}</span>
                </> : <></>}
            </Card.Text>
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    let outputPath = history?.outputPath;
    let outputName = history?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;
    let [text, setText] = useState<string>('');

    useEffect(() => {
        if (outputPath && fileSize !== 0) {
            (async () => {
                let text = await fetch('/' + outputPath).then(r => r.text());
                setText(text);
            })();
        }
    }, [outputPath, fileSize]);

    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output</Card.Title>
            {fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    download('/' + outputPath, outputName.endsWith('.txt') ? outputName : outputName + '.txt');
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body>
            <Card.Text>Output format: text
                <br/>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                    <br/>
                </> : <></>}
                <br/>
                {outputPath ? <>
                    <span style={{fontWeight: 'bold'}}>Output: </span>
                    <br/>
                    <span style={{whiteSpace: "pre-wrap"}}>{text}</span>
                </> : <></>}
            </Card.Text>
        </Card.Body>
    </>;
}

export default function SingleTextViewer(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}