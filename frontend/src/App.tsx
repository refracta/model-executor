import React, {useState} from 'react';
import {Navigate, Route, Routes, useMatch, useParams} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';
import './App.css';
import Aside from "./components/sidebar/Aside";
import {Menu} from "react-pro-sidebar";
import ModelMenu from "./components/sidebar/menu/impl/ModelMenu";
import SiteMenu from "./components/sidebar/menu/SiteMenu";
import SettingMenu from "./components/sidebar/menu/impl/SettingMenu";
import HistoryMenu from "./components/sidebar/menu/impl/HistoryMenu";
import {ModelData} from "./types/DataTypes";
import useData from "./hooks/useData";

const isMatch = (pattern: string) => useMatch(pattern) ? true : false;


function App() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [model, setModel] = useState<ModelData | null>(null);
    let data = {model, setModel, models, setModels};
    let modelUniqueName = useMatch('/model/:uniqueName')?.params?.uniqueName;
    !async function(){
        let loadedModels = await fetch('/api/models').then(r=>r.json());
        if (models.length === 0 && loadedModels) {
            setModels(loadedModels);
        }
/*        if(modelUniqueName) {
            let loadedModel = await fetch('/api/model/' + modelUniqueName).then(r=>r.json());;
            if (model === null && loadedModel || modelUniqueName !== model?.uniqueName) {
                setModel(loadedModel);
            }
        }*/
    }();

    const [toggled, setToggled] = useState(false);
    return (
        <Routes>
            <Route path='*' element={
                <div className='app'>
                    <Aside toggled={toggled} setToggled={setToggled}>
                        <SiteMenu/>
                        <Menu className={'content-menu'}>
                            <Routes>
                                <Route path="/model/" element={<ModelMenu data={data}/>}/>
                                <Route path="/model/:uniqueName" element={<ModelMenu data={data}/>}/>
                                <Route path="/history/*" element={<HistoryMenu/>}/>
                                <Route path="/setting/*" element={<SettingMenu/>}/>
                            </Routes>
                        </Menu>
                    </Aside>
                </div>
            }/>
            <Route path='/' element={<Navigate to="/model" replace/>}/>
        </Routes>
    );
}

export default App;
