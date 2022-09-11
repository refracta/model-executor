import React from 'react';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';
import './App.css';
import './styles/App.scss';

import AsideLegacy from "./components/AsideLegacy";
import Model from "./components/contents/Model";
import Setting from "./components/contents/Setting";
import History from "./components/contents/History";
import Aside from "./components/sidebar/Aside";
import SiteMenu from "./components/sidebar/enum/SiteMenu";

function App() {
    return (
        <div className='app'>
            <BrowserRouter>
                <Routes>
                    <Route path="/model" element={
                        <>
                            <Aside siteMenu={SiteMenu.Model}/>
                            <Model/>
                        </>
                    }/>
                    <Route path="/model/*" element={
                        <>
                            <Aside siteMenu={SiteMenu.Model}/>
                            <Model/>
                        </>
                    }/>

                    <Route path="/history" element={
                        <>
                            <Aside siteMenu={SiteMenu.History}/>
                            <History/>
                        </>
                    }/>
                    <Route path="/model/history/*" element={
                        <>
                            <Aside siteMenu={SiteMenu.History}/>
                            <History/>
                        </>
                    }/>

                    <Route path="/setting" element={
                        <>
                            <Aside siteMenu={SiteMenu.Setting}/>
                            <Setting/>
                        </>
                    }/>
                    <Route path="/setting/*" element={
                        <>
                            <Aside siteMenu={SiteMenu.Setting}/>
                            <Setting/>
                        </>
                    }/>

                    <Route path="*" element={<>
                        <Navigate to="/model" replace />
                    </>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
