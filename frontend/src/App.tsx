import React, {useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';
import './App.css';
import Model from "./components/contents/Model";
import Setting from "./components/contents/Setting";
import History from "./components/contents/History";
import Aside from "./components/sidebar/Aside";
import SiteMenu from "./components/sidebar/enum/SiteMenu";
import Main from "./components/contents/base/Main";

function App() {
    const [toggled, setToggled] = useState(false);
    const handleToggledChange = (checked: boolean) => {
        setToggled(checked);
    };

    return (
        <div className='app'>
            <BrowserRouter>
                <Routes>
                    <Route path="/model" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.Model}/>
                            <Main handleToggleSidebar={handleToggledChange}><Model/></Main>
                        </>
                    }/>
                    <Route path="/model/:uniqueName" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.Model}/>
                            <Main handleToggleSidebar={handleToggledChange}><Model/></Main>
                        </>
                    }/>

                    <Route path="/history" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.History}/>
                            <History/>
                        </>
                    }/>
                    <Route path="/model/history/*" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.History}/>
                            <History/>
                        </>
                    }/>

                    <Route path="/setting" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.Setting}/>
                            <Setting/>
                        </>
                    }/>
                    <Route path="/setting/*" element={
                        <>
                            <Aside toggled={toggled} handleToggleSidebar={handleToggledChange}
                                   siteMenu={SiteMenu.Setting}/>
                            <Setting/>
                        </>
                    }/>

                    <Route path="*" element={<>
                        <Navigate to="/model" replace/>
                    </>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
