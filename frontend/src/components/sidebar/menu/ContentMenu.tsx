import React, {useState, useEffect} from 'react';
import {Menu, MenuItem, SubMenu} from "react-pro-sidebar";
import SiteMenu from "../enum/SiteMenu";
import ModelMenu from "./impl/ModelMenu";
import HistoryMenu from "./impl/HistoryMenu";
import SettingMenu from "./impl/SettingMenu";

interface Props {
    siteMenu: SiteMenu
}

function ContentMenu({siteMenu}: Props) {
    switch (siteMenu) {
        case SiteMenu.Model:
            return (
                <Menu>
                    <ModelMenu></ModelMenu>
                </Menu>
            );
            break;
        case SiteMenu.History:
            return (
                <Menu iconShape="circle">
                    <HistoryMenu></HistoryMenu>
                </Menu>
            );
            break;
        case SiteMenu.Setting:
            return (
                <Menu iconShape="circle">
                    <SettingMenu></SettingMenu>
                </Menu>
            );
            break;
    }
}

export default ContentMenu;