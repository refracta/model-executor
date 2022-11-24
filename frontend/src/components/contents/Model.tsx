import React from 'react';
import Split from 'react-split'

import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {AppData, ModelData} from "../../types/Types";
import IOModule from "../io/IOModule";
import Terminal from "../terms/Terminal";
import {FitAddon} from "xterm-addon-fit";

// JSP(param1, param2) <= parametr
function Model({data}: { data: AppData }) {
    let fitAddon = new FitAddon();
    let model = data.model as ModelData;
    let config = model?.config;
    let fit = fitAddon.fit.bind(fitAddon);
    return (
        <Split className="split-container" sizes={[75, 25]} direction="vertical" onDrag={fit} onDragEnd={fit} onDragExit={fit}>
            <div className="main-content-container">
                <Row xs={1} md={2} className="h-100">
                    <Col className='left-col'>
                        <Card className='card-explain'>
                            <Card.Body>
                                <Card.Title>{config!.name}</Card.Title>
                                <Card.Text>
                                    <span style={{whiteSpace: "pre-wrap"}}>{config!.explain}</span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <Card className='card-upload' style={{overflow: 'hidden'}}>
                            <Card.Body>
                                <Card.Title>Input upload</Card.Title>

                                <IOModule moduleName={config!.input.module} model={model}></IOModule>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='right-col'>
                        <Card className='card-result'>
                            <Card.Body>
                                <Card.Title>Output</Card.Title>
                                <Card.Text>
                                    Output format: {config!.output.options.format.join(', ')}
                                </Card.Text>
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

export default Model;