import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {AppProps} from "../../types/Types";
import InputModule from "../card/module/InputModule";
import {Card} from "react-bootstrap";
import OutputDescriptionModule from "../card/module/OutputDescriptionModule";
import ModelExplainModule from "../card/module/ModelExplainModule";
import ParameterModule from "../card/module/ParameterModule";
import OutputModule from "../card/module/OutputModule";
import TerminalSplitContainer from "./TerminalSplitContainer";

export default function Model({context}: AppProps) {
    return <TerminalSplitContainer context={context}>
        <Row xs={1} md={2} className="pb-3 h-100">
            <Col className='left-col ps-md-2 pe-md-1 pt-2 pb-2 mb-md-0'>
                <Card className='card-explain mb-2 h-25'>
                    <ModelExplainModule context={context}/>
                </Card>
                <Card className='card-parameter mb-2 h-50'>
                    <ParameterModule context={context}/>
                </Card>
                <Card className='card-upload h-25'>
                    <InputModule context={context}/>
                </Card>
            </Col>
            <Col className='right-col ps-md-1 pe-md-2 pt-2 pb-2'>
                <Card className='card-output mb-2 h-75'>
                    <OutputModule context={context}/>
                </Card>
                <Card className='card-output-description mb-2'>
                    <OutputDescriptionModule context={context}/>
                </Card>
            </Col>
        </Row>
    </TerminalSplitContainer>
}
