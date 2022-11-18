import React, {ReactNode} from 'react';
import NavbarMenu from "../../sidebar/menu/impl/NavbarMenu";


interface Props {
    children: ReactNode
    handleToggleSidebar: (value: boolean) => void
}

function Main({children, handleToggleSidebar}: Props) {
    return (<main>
        <NavbarMenu handleToggleSidebar={handleToggleSidebar}></NavbarMenu>
        {children}
    </main>);
}

export default Main;