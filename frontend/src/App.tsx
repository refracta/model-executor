import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useMatch} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';
import './App.css';
import Aside from "./components/sidebar/Aside";
import {ModelData} from "./types/Types";
import Main from "./components/contents/base/Main";

import useWebSocket from "react-use-websocket";

function App() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [model, setModel] = useState<ModelData | null>(null);
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket((location.protocol.startsWith('https') ? 'wss://' : 'ws://') + location.host + '/websocket', {
        shouldReconnect: (closeEvent) => true,
        onMessage: (message) => {
            let data = JSON.parse(message.data);
            if (data?.msg === 'UpdateModels') {
                console.log(data);
                setModels(data.models);
            } else if (data?.msg === 'UpdateModel') {
                console.log(data);
                setModel(data.model);
            }
        }
    });

    let data = {
        model,
        setModel,
        models,
        setModels,
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    };
    let modelUniqueName = useMatch('/model/:uniqueName')?.params?.uniqueName;
    let path = useMatch('/*')?.params['*'];
    useEffect(() => {
        sendJsonMessage({msg: 'Path', path});
    }, [path]);

    useEffect(() => {
        !async function () {
            if (models.length === 0) {
                let loadedModels = await fetch('/api/models').then(r => r.json());
                setModels(loadedModels);
            }
        }();
    });

    useEffect(() => {
        !async function () {
            if (modelUniqueName && modelUniqueName !== null && modelUniqueName !== model?.uniqueName) {
                let loadedModel = await fetch('/api/model/' + modelUniqueName).then(r => r.json());
                setModel(loadedModel);
            }
        }();
    }, [modelUniqueName]);

    const [toggled, setToggled] = useState(false);
    return (
        <Routes>
            <Route path='*' element={
                <div className='app'>
                    <Aside toggled={toggled} setToggled={setToggled} data={data} modelUniqueName={modelUniqueName}/>
                    <Main setToggled={setToggled} data={data}/>
                </div>
            }></Route>
            <Route path='/' element={<Navigate to="/model" replace/>}/>
        </Routes>
    );
}

export default App;
