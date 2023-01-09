import React from 'react';
import {Card} from "react-bootstrap";
import {AppData, ModelData} from "../../../types/Types";
export default function OutputDescriptionModule({data}: { data: AppData }) {
    let model = data.model;
    if (!model) {
        return <></>;
    }
    return <>
        <Card.Header>
            <Card.Title className='mb-0'>Output description {model.lastHistory ?
                <span className="badge green">Last executed</span> : ''}</Card.Title>
        </Card.Header>
        <Card.Body>
            <Card.Text>
                <span style={{whiteSpace: "pre-wrap"}}>{model.lastHistory?.description}</span>
            </Card.Text>
        </Card.Body>
    </>;
}
