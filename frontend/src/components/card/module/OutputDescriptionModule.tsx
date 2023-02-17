import React from 'react';
import {Card} from "react-bootstrap";
import {AppContext, AppProps} from "../../../types/Types";
import Linkify from "react-linkify";

function renderModelView({context}: AppProps) {
    let model = context.model;
    return <>
        <Card.Header>
            <Card.Title className='mb-0'>Output description {model?.lastHistory?.description ?
                <span className="badge green">Last executed</span> : ''}</Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>
                <span style={{whiteSpace: "pre-wrap"}}><Linkify>{model?.lastHistory?.description}</Linkify></span>
            </Card.Text>
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    return <>
        <Card.Header>
            <Card.Title className='mb-0'>Output description</Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>
                <span style={{whiteSpace: "pre-wrap"}}><Linkify>{history?.description}</Linkify></span>
            </Card.Text>
        </Card.Body>
    </>;
}

export default function OutputDescriptionModule(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}
