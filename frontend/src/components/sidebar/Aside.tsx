import React from 'react';
import {Menu, ProSidebar, SidebarContent, SidebarHeader} from "react-pro-sidebar";
import {Route, Routes} from 'react-router-dom';
import {AppData} from "../../types/Types";
import SiteMenu from "./menu/SiteMenu";
import ModelMenu from "./menu/impl/ModelMenu";
import HistoryMenu from "./menu/impl/HistoryMenu";
import SettingMenu from "./menu/impl/SettingMenu";

interface Props {
    toggled: boolean,
    setToggled: (value: boolean) => void,
    data: AppData,
    modelUniqueName?: string
}

function Aside({toggled, setToggled, data, modelUniqueName}: Props) {
    return (
        <ProSidebar
            breakPoint="md"
            toggled={toggled}
            onToggle={setToggled}
        >
            <SidebarHeader>
                <div
                    style={{
                        padding: '24px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        fontSize: 14,
                        letterSpacing: '1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Model executor
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SiteMenu/>
                <Menu className={'content-menu'}>
                    <Routes>
                        <Route path="/model/" element={<ModelMenu data={data}/>}/>
                        <Route path="/model/:uniqueName"
                               element={<ModelMenu data={data} modelUniqueName={modelUniqueName}/>}/>
                        <Route path="/history/*" element={<HistoryMenu/>}/>
                        <Route path="/setting/*" element={<SettingMenu/>}/>
                    </Routes>
                </Menu>
            </SidebarContent>
        </ProSidebar>
    );
}

export default Aside;