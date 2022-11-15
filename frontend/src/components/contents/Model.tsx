import React from 'react';
import Split from 'react-split'

import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {useParams} from "react-router-dom";
import useData from "../../hooks/useData";
import {ConfigData, ModelData} from "../../DataTypes";

import useWebSocket, {ReadyState} from 'react-use-websocket';


interface Props {
    handleToggleSidebar: any
}

// JSP(param1, param2) <= parametr
function Model() {
    let {uniqueName} = useParams();
    const models: ModelData[] = useData('/api/model');
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket((location.protocol.startsWith('https') ? 'wss://' : 'ws://') + location.host + '/ws', {
        onOpen: () => console.log('opened'),
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
    });

    if (!models || readyState == 0) {
        return <></>;
    }


    let model = models.find(m => m.uniqueName == uniqueName) as ModelData;
    let config = model.config;
    return (
        <Split className="split-container" sizes={[75, 25]} direction="vertical">
            <div className="main-content-container">
                <Row xs={1} md={2} className="h-100">
                    <Col className='left-col'>
                        <Card className='card-explain'>
                            <Card.Body>
                                <Card.Title>{config.name}</Card.Title>
                                <Card.Text>
                                    <span style={{whiteSpace: "pre-wrap"}}>{config.explain}</span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <Card className='card-upload'>
                            <Card.Body>
                                <Card.Title>Input upload</Card.Title>
                                <Card.Text>
                                    Drag & Drop or Upload button <br></br>(Support
                                    format: {Object.keys(config.input).join(', ')})<br></br>
                                    <button>Upload</button>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='right-col'>
                        <Card className='card-result'>
                            <Card.Body>
                                <Card.Title>Output</Card.Title>
                                <Card.Text>
                                    Output format: {Object.keys(config.output).join(', ')}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div className="terminal-container">
                <h1>Terminal Container</h1>
            </div>
        </Split>
    );
}

export default Model;