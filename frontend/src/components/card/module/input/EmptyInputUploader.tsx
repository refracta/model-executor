import React from 'react';
import {AppProps, ModelStatus} from "../../../../types/Types";
import {Button, Card} from "react-bootstrap";

function renderModelView({context}: AppProps) {
    let model = context.model;

    return <>
        <Card.Header>
            <Card.Title>Model control</Card.Title>
        </Card.Header>
        <Card.Body>
            <Button disabled={model?.status !== ModelStatus.OFF} className='start-model-btn'
                    onClick={async () => {
                        const data = new FormData();
                        let file = new File(["{}"], "empty");
                        data.append('files', file, file.name);
                        data.append('modelUniqueName', model?.uniqueName as string);
                        data.append('parameters', JSON.stringify(context.parameters));

                        let result = await fetch('/api/upload', {
                            method: 'POST',
                            body: data,
                        }).then(r => r.json());
                        if (result.status === 'success') {
                            console.log('Upload done!');
                        } else {
                            console.log('Upload error...');
                        }
                    }
                    }>Start model</Button>
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    return <>
        <Card.Header>
            <Card.Title>Input</Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>No input provided.</Card.Text>
        </Card.Body>
    </>;
}

export default function EmptyInputUploader(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}