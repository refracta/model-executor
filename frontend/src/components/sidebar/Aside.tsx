import React, {useEffect, useState} from 'react';
import SiteMenu from "./enum/SiteMenu";
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarHeader, SubMenu} from "react-pro-sidebar";
import {FaHistory, FaStar} from "react-icons/fa";
import {AiFillSetting} from "react-icons/ai";
import {Link} from 'react-router-dom';
import ContentMenu from "./menu/ContentMenu";

interface Props {
    siteMenu: SiteMenu
}

function Aside({siteMenu}: Props) {
    /*    const models
        let mm;
        useEffect(() => {
            (async () => {
                let models = await fetch('api/model').then(r => r.json());
                for (let m of models) {
                    let hierarchy: string[] = m.hierarchy;
                    let jsx = <div></div>;
                    let g = [React.createElement('div', {key: 1}, 'hello'), React.createElement('div', {key: 2}, 'hello')];
                    mm = React.createElement(MenuItem, null, g);
                    console.log(m);

                }
            })();
        }, []);*/
    return (
        <ProSidebar
            breakPoint="md"
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
                <Menu iconShape="circle">
                    <MenuItem active={siteMenu == SiteMenu.Model} icon={<FaStar/>}>Model<Link to="/model"/></MenuItem>
                    <MenuItem active={siteMenu == SiteMenu.History} icon={<FaHistory/>}>History<Link
                        to="/history"/></MenuItem>
                    <MenuItem active={siteMenu == SiteMenu.Setting} icon={<AiFillSetting/>}>Setting<Link to="/setting"/></MenuItem>
                </Menu>
                <ContentMenu siteMenu={siteMenu}></ContentMenu>
            </SidebarContent>
        </ProSidebar>
    );
}

export default Aside;