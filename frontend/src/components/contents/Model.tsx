import React, {useEffect, useRef, useState} from 'react';
import Split from 'react-split'

import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {AppData, ModelData} from "../../types/Types";
import IOModule from "../io/IOModule";
import Terminal from "../terms/Terminal";
import {FitAddon} from "xterm-addon-fit";
import {JsonForms} from '@jsonforms/react';
import {materialCells, materialRenderers} from '@jsonforms/material-renderers';
import {Button, Nav, Tab} from "react-bootstrap";
import ReactJson from "react-json-view";

export default function Model({data}: { data: AppData }) {
    const [parameters, setParameters] = useState({});
    const [resetVisible, setResetVisible] = useState(false);

    let fitAddon = new FitAddon();
    let model = data.model as ModelData;
    let config = model?.config;
    useEffect(() => {
        let data = config?.input?.form?.data;
        if (data) {
            setParameters(data);
        }
    }, [config?.input.form])
    let fit = fitAddon.fit.bind(fitAddon);
    let form = model.config?.input.form;

    let previousSize = [75, 25];
    let previousCardHeight = -1;
    const splitRef = useRef<any>();
    const onDrag = (sizes: number[]) => {
        fit();
        let cardHeight = (document.querySelector('.input-upload-card-body') as HTMLElement).clientHeight;

        if (cardHeight === 0) {
            splitRef.current.split.setSizes(previousSize);
        } else {
            console.log(sizes, cardHeight, previousSize);
            console.log(splitRef);
            previousSize = sizes;
            previousCardHeight = cardHeight;
        }
    };

    useEffect(() => {
        setResetVisible(!(model.status === 'off' || model.status === 'error'));
    }, [model]);
    return (
        <Split ref={splitRef} className="split-container" sizes={[75, 25]} direction="vertical" onDrag={onDrag}
               onDragEnd={fit}
               onDragExit={fit}>
            <div className="main-content-container">
                <Row xs={1} md={2} className="pb-3 h-100">
                    <Col className='left-col ps-md-2 pe-md-1 pt-2 pb-2 mb-md-0'>
                        <Card className='card-explain mb-2 h-25'>
                            <Card.Header>
                                <Card.Title className='mb-0'>{config!.name}</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className='p-3'>
                                    <Card.Text>
                                        <span style={{whiteSpace: "pre-wrap"}}>{config!.explain}</span>
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card className='card-parameter mb-2 h-50'>
                            <Tab.Container defaultActiveKey="parameters-default">
                                <Card.Header>
                                    <Nav variant="tabs" className="column">
                                        <Nav.Item>
                                            <Nav.Link eventKey="parameters-default">Parameters</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="parameters-json">Parameters (JSON)</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Card.Header>
                                <Card.Body>
                                    <div className='p-3'>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="parameters-default">
                                                {form?.schema && Object.keys(form?.schema).length ? <JsonForms
                                                    schema={form?.schema}
                                                    data={form?.data}
                                                    uischema={form?.uischema}
                                                    renderers={materialRenderers}
                                                    cells={materialCells}
                                                    readonly={model.status !== 'off'}
                                                    onChange={({errors, data}) => setParameters(data)}
                                                /> : <></>}
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="parameters-json">
                                                <ReactJson src={parameters}/>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </div>
                                </Card.Body>
                            </Tab.Container>
                        </Card>
                        <Card className='card-upload h-25'>
                            <Card.Header>
                                <Card.Title className='mb-0 float-start'>Input upload</Card.Title>
                                {resetVisible ? <Button className='float-end btn-sm info' onClick={async (e) => {
                                    let loadedModel = await fetch('/api/model/' + model.uniqueName).then(r => r.json());
                                    data.setModel(loadedModel);
                                }}>Reset</Button> : <></>}
                            </Card.Header>
                            <Card.Body className='input-upload-card-body'>
                                <div className='p-3'>
                                    <IOModule moduleName={config!.input.module} model={model}
                                              parameters={parameters}/>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='right-col ps-md-1 pe-md-2 pt-2 pb-2'>
                        <Card className='card-output mb-2 h-75'>
                            <Card.Header>
                                <Card.Title className='mb-0'>Output {model?.lastHistory ?
                                    <span className="badge green">Last executed</span> : ''}</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className='p-3'>
                                    <IOModule moduleName={config!.output.module} model={model}/>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card className='card-output-description mb-2'>
                            <Card.Header>
                                <Card.Title className='mb-0'>Output description {model?.lastHistory ?
                                    <span className="badge green">Last executed</span> : ''}</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className='p-3'>
                                    <Card.Text>
                                        <span style={{whiteSpace: "pre-wrap"}}>{model.lastHistory?.description}</span>
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div className="terminal-container">
                <Terminal data={data} fitAddon={fitAddon}/>
            </div>
        </Split>
    );
}
