import React, {useEffect, useState} from 'react';
import SiteMenu from "./enum/SiteMenu";
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from "react-pro-sidebar";
import {FaHistory, FaStar} from "react-icons/fa";
import {AiFillSetting} from "react-icons/ai";
import {Link, useParams} from 'react-router-dom';
import ContentMenu from "./menu/ContentMenu";

interface Props {
    siteMenu: SiteMenu,
    toggled:boolean,
    handleToggleSidebar: (value: boolean) => void
}

function Aside({siteMenu, toggled, handleToggleSidebar}: Props) {
    return (
        <ProSidebar
            breakPoint="md"
            toggled={toggled}
            onToggle={handleToggleSidebar}
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
                <Menu className={'site-menu'} iconShape="circle">
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