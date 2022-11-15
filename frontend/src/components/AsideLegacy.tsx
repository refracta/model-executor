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
import {FaStar, FaHistory} from 'react-icons/fa';
import {AiFillSetting} from 'react-icons/ai';

interface Props {
    image: boolean,
    collapsed: boolean,
    toggled: boolean,
    handleToggleSidebar: (value: boolean) => void
}

const AsideLegacy = () => {
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
                    {'Model executor'}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <Menu iconShape="circle">
                    <MenuItem active={true}
                              icon={<FaStar/>}
                    >
                        Model
                    </MenuItem>
                    <MenuItem icon={<FaHistory/>}> History</MenuItem>
                    <MenuItem icon={<AiFillSetting/>}> Setting</MenuItem>
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
        </ProSidebar>
    );
};

export default AsideLegacy;
