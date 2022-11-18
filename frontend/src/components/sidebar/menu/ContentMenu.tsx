import React, {useState, useEffect} from 'react';
import {Menu, MenuItem, SubMenu} from "react-pro-sidebar";
import ModelMenu from "./impl/ModelMenu";
import HistoryMenu from "./impl/HistoryMenu";
import SettingMenu from "./impl/SettingMenu";
import {useParams} from "react-router-dom";


function ContentMenu() {
    let {uniqueName} = useParams();
/*    switch (siteMenu) {
        case SiteMenu.Model:
            return (
                <Menu className={'content-menu'}>
                    <ModelMenu uniqueName={uniqueName}></ModelMenu>
                </Menu>
            );
            break;
        case SiteMenu.History:
            return (
                <Menu className={'content-menu'} iconShape="circle">
                    <HistoryMenu></HistoryMenu>
                </Menu>
            );
            break;
        case SiteMenu.Setting:
            return (
                <Menu className={'content-menu'} iconShape="circle">
                    <SettingMenu></SettingMenu>
                </Menu>
            );
            break;
    }*/
}

export default ContentMenu;