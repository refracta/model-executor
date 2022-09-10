import React, {useState} from 'react';
import Aside from './Aside';
import Main from './Main';

function Layout() {
    const [rtl, setRtl] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [image, setImage] = useState(true);
    const [toggled, setToggled] = useState(false);

    const handleCollapsedChange = (checked: boolean) => {
        setCollapsed(checked);
    };

    const handleRtlChange = (checked: boolean) => {
        setRtl(checked);
    };
    const handleImageChange = (checked: boolean) => {
        setImage(checked);
    };

    const handleToggleSidebar = (value: boolean) => {
        setToggled(value);
    };

    return (
        <div className={`app ${rtl ? 'rtl' : ''} ${toggled ? 'toggled' : ''}`}>
            <Aside
                image={image}
                collapsed={collapsed}
                rtl={rtl}
                toggled={toggled}
                handleToggleSidebar={handleToggleSidebar}
            />
            <Main
                image={image}
                collapsed={collapsed}
                rtl={rtl}
                handleToggleSidebar={handleToggleSidebar}
                handleCollapsedChange={handleCollapsedChange}
                handleRtlChange={handleRtlChange}
                handleImageChange={handleImageChange}
            />
        </div>
    );
}

export default Layout;
