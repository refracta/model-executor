import React, {useEffect} from 'react';
import {Card, Nav, Tab} from "react-bootstrap";
import {JsonForms} from "@jsonforms/react";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";
import {JsonViewer} from '@textea/json-viewer'
import {AppProps, ModelStatus, WSMessageType} from "../../../types/Types";

function renderModelView({context}: AppProps) {
    let model = context.model;
    let config = context.model?.config;
    let parameters = config?.input.parameters;

    useEffect(() => {
        let defaultData = config?.input?.parameters?.data;
        if (defaultData) {
            context.setParameters(defaultData);
        } else {
            context.setParameters({});
        }
    }, [config?.input.parameters]);

    useEffect(() => {
        let message = context.lastJsonMessage as any;
        if (message?.msg === WSMessageType.UpdateModel && message?.model?.status === ModelStatus.DEPLOYING) {
            (document.querySelector('.last-parameters-json > a') as HTMLElement)?.click();
        }
    }, [context.lastJsonMessage]);

    useEffect(() => {
        (document.querySelector('.parameters-default > a') as HTMLElement)?.click();
    }, [model?.uniqueName]);

    return <>
        <Tab.Container defaultActiveKey="parameters-default">
            <Card.Header>
                <Nav variant="tabs" className="column">
                    <Nav.Item className='parameters-default'>
                        <Nav.Link eventKey="parameters-default">Parameters</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="parameters-json">Parameters (JSON)</Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='last-parameters-json'>
                        <Nav.Link eventKey="last-parameters-json">Last parameters (JSON)</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Card.Header>
            <Card.Body>
                <Tab.Content>
                    <Tab.Pane eventKey="parameters-default">
                        {parameters?.schema && Object.keys(parameters?.schema).length ? <JsonForms
                            schema={parameters?.schema}
                            data={parameters?.data}
                            uischema={parameters?.uischema}
                            renderers={materialRenderers}
                            cells={materialCells}
                            readonly={model?.status !== 'off'}
                            onChange={({errors, data}) => {
                                context.setParameters(data);
                            }}
                        /> : <></>}
                    </Tab.Pane>
                    <Tab.Pane eventKey="parameters-json">
                        <JsonViewer value={context.parameters ? context.parameters : {}}/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="last-parameters-json">
                        <JsonViewer value={model?.lastHistory?.parameters ? model?.lastHistory?.parameters : {}}/>
                    </Tab.Pane>
                </Tab.Content>
            </Card.Body>
        </Tab.Container></>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    return <>
        <Tab.Container defaultActiveKey="parameters-default">
            <Card.Header>
                <Card.Title className='mb-0'>Input parameter (JSON)</Card.Title>
            </Card.Header>
            <Card.Body>
                <JsonViewer value={history?.parameters}/>
            </Card.Body>
        </Tab.Container></>
}

export default function ParameterModule(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}
