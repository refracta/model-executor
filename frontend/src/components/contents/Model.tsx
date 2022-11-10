import React from 'react';
import Split from 'react-split'

import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";

interface Props {
    handleToggleSidebar: any
}

// JSP(param1, param2) <= parametr
function Model() {
    return (
        <Split className="split-container" sizes={[75, 25]} direction="vertical">
            <div className="main-content-container">
                <Row xs={1} md={2} className="h-100">
                    <Col className='left-col'>
                        <Card className='card-explain'>
                            <Card.Body>
                                <Card.Title>SRGAN-JTBC</Card.Title>
                                <Card.Text>
                                    <span>SRGAN을 이용한 JTBC 과제 추론 모델입니다.<br></br><br></br>YYYY-MM-DD일 최신화 완료</span>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <Card className='card-upload'>
                            <Card.Body>
                                <Card.Title>Input upload</Card.Title>
                                <Card.Text>
                                    Drag & Drop or Upload button <br></br>(Support format: png, zip)<br></br><button>Upload</button>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='right-col'>
                        <Card className='card-result'>
                            <Card.Body>
                                <Card.Title>Output</Card.Title>
                                <Card.Text>
                                    이곳에 모델의 결과가 출력됩니다.
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