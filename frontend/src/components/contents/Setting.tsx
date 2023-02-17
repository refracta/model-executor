import React from 'react';
import {AppProps} from "../../types/Types";
import {Button, Card, ListGroup} from "react-bootstrap";

const fetchWithAlert = (url: string) => {
    return async () => {
        let response = await fetch(url, {
            method: 'GET',
        }).then(r => r.json());
        alert(response.result);
        location.reload();
    };
}

export default function Setting({context}: AppProps) {
    return <Card className='card-output m-2 h-100'>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Setting</Card.Title>
        </Card.Header>
        <Card.Body>
            <ListGroup>
                <ListGroup.Item>
                    <span>Force stop all containers</span>
                    <Button className='float-end' variant='danger'
                            onClick={fetchWithAlert('/api/setting/stop')}>Request</Button>
                </ListGroup.Item>
                <ListGroup.Item>
                    <span>Clear database</span>
                    <Button className='float-end' variant='danger'
                            onClick={fetchWithAlert('/api/setting/clear-database')}>Request</Button>
                </ListGroup.Item>
                <ListGroup.Item>
                    <span>Clear resources</span>
                    <Button className='float-end' variant='danger'
                            onClick={fetchWithAlert('/api/setting/clear-resources')}>Request</Button>
                </ListGroup.Item>
                <ListGroup.Item>
                    <span>Reload server config</span>
                    <Button className='float-end' variant='primary'
                            onClick={fetchWithAlert('/api/setting/reload-config')}>Reload</Button>
                </ListGroup.Item>
            </ListGroup>

        </Card.Body>
    </Card>;
}
