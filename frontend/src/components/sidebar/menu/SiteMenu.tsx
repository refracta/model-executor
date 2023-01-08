import React from 'react';
import {Menu, MenuItem} from 'react-pro-sidebar';
import {FaHistory, FaStar} from "react-icons/fa";
import {AiFillSetting} from "react-icons/ai";
import {Link, useMatch} from 'react-router-dom';

const isMatch = (pattern: string) => useMatch(pattern) ? true : false;

export default function SiteMenu() {
    return <Menu className={'site-menu'} iconShape="circle">
        <MenuItem active={isMatch("/model/*")} icon={<FaStar/>}>
            Model
            <Link to="/model"/>
        </MenuItem>
        <MenuItem active={isMatch("/history")} icon={<FaHistory/>}>
            History
            <Link to="/history"/></MenuItem>
        <MenuItem active={isMatch("/setting")} icon={<AiFillSetting/>}>
            Setting
            <Link to="/setting"/></MenuItem>
    </Menu>;
}