import React, {ReactNode, useEffect, useState} from 'react';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from "react-pro-sidebar";
import {FaHistory, FaStar} from "react-icons/fa";
import {AiFillSetting} from "react-icons/ai";
import {Link, useParams} from 'react-router-dom';
import ContentMenu from "./menu/ContentMenu";

interface Props {
    toggled:boolean,
    setToggled: (value: boolean) => void,
    children :ReactNode
}

function Aside({toggled, setToggled, children}: Props) {
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
                {children}
            </SidebarContent>
        </ProSidebar>
    );
}

export default Aside;