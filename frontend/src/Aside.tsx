import React from 'react';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FaTachometerAlt, FaGem, FaList, FaGithub, FaRegLaughWink, FaHeart, FaStar, FaHistory } from 'react-icons/fa';
import { AiFillSetting } from 'react-icons/ai';
import sidebarBg from './assets/bg2.jpg';

interface Props {
  image:boolean,
  collapsed:boolean,
  rtl:boolean,
  toggled:boolean,
  handleToggleSidebar:(value: boolean) => void
}

const Aside = ({ image, collapsed, rtl, toggled, handleToggleSidebar }:Props) => {
  return (
    <ProSidebar
      image={image ? sidebarBg : undefined}
      rtl={rtl}
      collapsed={collapsed}
      toggled={toggled}
      breakPoint="md"
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
          {'Model executor'}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem
            icon={<FaStar />}
          >
            Model
          </MenuItem>
          <MenuItem icon={<FaHistory />}> History</MenuItem>
          <MenuItem icon={<AiFillSetting />}> Setting</MenuItem>
        </Menu>
        <Menu iconShape="circle">
            <MenuItem suffix={<span className="badge green">Running</span>}>1 </MenuItem>
            <MenuItem suffix={<span className="badge yellow">Deploying</span>}>2 </MenuItem>
            <MenuItem suffix={<span className="badge red">Undeploying</span>}>2 </MenuItem>
            <SubMenu title={`$3`}>
              <MenuItem>3.1 </MenuItem>
              <MenuItem>3.2 </MenuItem>
              <SubMenu title={`$3.3`}>
                <MenuItem>3.3.1 </MenuItem>
                <MenuItem>3.3.2 </MenuItem>
                <MenuItem>3.3.3 </MenuItem>
              </SubMenu>
          </SubMenu>
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center' }}>
        <div
          className="sidebar-btn-wrapper"
          style={{
            padding: '20px 24px',
          }}
        >
          <a
            href="https://github.com/azouaoui-med/react-pro-sidebar"
            target="_blank"
            className="sidebar-btn"
            rel="noopener noreferrer"
          >
            <FaGithub />
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {'viewSource'}
            </span>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default Aside;
