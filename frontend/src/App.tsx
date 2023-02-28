import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useMatch} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/hack/card/MarginCardBodyReplacer';
import './styles/App.scss';
import './styles/Dropzone.css';
import './styles/Split.css';
import './styles/ProSidebar.scss';
import './App.css';
import Aside from "./components/sidebar/Aside";
import {HistoryData, ModelData, WSMessageType} from "./types/Types";
import Main from "./components/contents/base/Main";

import useWebSocket from "react-use-websocket";

export default function App() {
    const [model, setModel] = useState<ModelData | null>(null);
    const [models, setModels] = useState<ModelData[]>([]);
    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryData | null>(null);
    const [histories, setHistories] = useState<HistoryData[]>([]);
    const [historiesLoaded, setHistoriesLoaded] = useState<boolean>(false);
    const [parameters, setParameters] = useState<any>({});

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
            if (data?.msg === WSMessageType.UpdateModels) {
                console.log(data);
                setModels(data.models);
            } else if (data?.msg === WSMessageType.UpdateModel) {
                console.log(data);
                setModel(data.model);
            } else if (data?.msg === WSMessageType.UpdateHistories) {
                console.log(data);
                setHistories(data.histories);
            } else if (data?.msg === WSMessageType.UpdateHistory) {
                console.log(data);
                setHistory(data.history);
            }
        }
    });

    let modelUniqueName = useMatch('/model/:uniqueName')?.params?.uniqueName;
    let historyNumber = useMatch('/history/:historyNumber')?.params?.historyNumber;
    let path = useMatch('/*')?.params['*'] as string;
    useEffect(() => {
        sendJsonMessage({msg: 'Path', path});
    }, [path]);

    let context = {
        model,
        setModel,
        models,
        setModels,
        history,
        setHistory,
        histories,
        setHistories,
        parameters,
        setParameters,
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
        path
    };

    useEffect(() => {
        !async function () {
            if (!modelsLoaded) {
                let loadedModels = await fetch('/api/models').then(r => r.json());
                setModels(loadedModels);
                setModelsLoaded(true);
            }
        }();
    });

    useEffect(() => {
        !async function () {
            if (!historiesLoaded) {
                let loadedHistories = await fetch('/api/histories').then(r => r.json());
                setHistories(loadedHistories);
                setHistoriesLoaded(true);
            }
        }();
    });

    useEffect(() => {
        !async function () {
            if (modelUniqueName && modelUniqueName !== null && modelUniqueName !== model?.uniqueName) {
                let loadedModel = await fetch('/api/model/' + modelUniqueName).then(r => r.json());
                setModel(loadedModel);
            } else {
                setModel(null);
            }
        }();
    }, [modelUniqueName, path]);

    useEffect(() => {
        !async function () {
            let parsedHistoryNumber = parseInt(historyNumber as string);
            if (!isNaN(parsedHistoryNumber) && parsedHistoryNumber !== history?.number) {
                let loadedHistory = await fetch('/api/history/' + parsedHistoryNumber).then(r => r.json());
                setHistory(loadedHistory);
            } else {
                setHistory(null);
            }
        }();
    }, [historyNumber, path]);

    const [toggled, setToggled] = useState(false);
    return (
        <Routes>
            <Route path='*' element={
                <div className='app'>
                    <Aside toggled={toggled} setToggled={setToggled} context={context}
                           modelUniqueName={modelUniqueName} historyNumber={parseInt(historyNumber as string)}/>
                    <Main setToggled={setToggled} context={context}/>
                </div>
            }></Route>
            {models.length > 0 ? <Route path='/model' element={<Navigate to={`/model/${models[models.length - 1].uniqueName}`} replace/>}/> : <></>}
            {histories.length > 0 ? <Route path='/history' element={<Navigate to={`/history/${histories.length}`} replace/>}/> : <></>}
        </Routes>
    );
}