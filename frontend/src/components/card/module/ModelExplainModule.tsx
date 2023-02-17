import React from 'react';
import {AppProps} from "../../../types/Types";
import {Card} from "react-bootstrap";
import dayjs from 'dayjs';
import Linkify from 'react-linkify';

function renderModelView({context}: AppProps) {
    let config = context.model?.config;
    if (!config) {
        return <></>;
    }
    return <>
        <Card.Header>
            <Card.Title className='mb-0'>{config!.name}</Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>
                <span style={{whiteSpace: "pre-wrap"}}><Linkify>{config!.explain}</Linkify></span>
            </Card.Text>
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    let formattedDate = dayjs(history?.time).format("YYYY-MM-DD HH:mm:ss");
    return <>
        <Card.Header>
            <Card.Title className='mb-0'>{history?.modelName} <span className="badge green">{history?.time ? <span
                style={{whiteSpace: "pre-wrap"}}>{formattedDate}</span> : <></>}</span></Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>
                <span style={{whiteSpace: "pre-wrap"}}><Linkify>{history?.modelExplain}</Linkify></span>
            </Card.Text>
        </Card.Body>
    </>;
}

export default function ModelExplainModule(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}