import React from 'react';
import {Menu, ProSidebar, SidebarContent, SidebarHeader} from "react-pro-sidebar";
import {Route, Routes} from 'react-router-dom';
import {AppProps} from "../../types/Types";
import SiteMenu from "./menu/SiteMenu";
import ModelMenu from "./menu/impl/ModelMenu";
import HistoryMenu from "./menu/impl/HistoryMenu";
import SettingMenu from "./menu/impl/SettingMenu";

type Props = {
    toggled: boolean,
    setToggled: (value: boolean) => void,
    modelUniqueName?: string
    historyNumber?: number
} & AppProps

export default function Aside({toggled, setToggled, context, modelUniqueName, historyNumber}: Props) {
    return (
        <ProSidebar breakPoint="md" toggled={toggled} onToggle={setToggled} style={{height: '100vh'}}>
            <SidebarHeader>
                <div className='sidebar-header-text'>Model executor</div>
            </SidebarHeader>
            <SidebarContent>
                <SiteMenu/>
                <Menu className={'content-menu'}>
                    <Routes>
                        <Route path="/model/" element={<ModelMenu context={context}/>}/>
                        <Route path="/model/:uniqueName"
                               element={<ModelMenu context={context} modelUniqueName={modelUniqueName}/>}/>
                        <Route path="/history/*" element={<HistoryMenu context={context} historyNumber={historyNumber}/>}/>
                        <Route path="/setting/*" element={<SettingMenu/>}/>
                    </Routes>
                </Menu>
            </SidebarContent>
        </ProSidebar>
    );
}