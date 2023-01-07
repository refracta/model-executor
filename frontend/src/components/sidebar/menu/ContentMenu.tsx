import React from 'react';
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