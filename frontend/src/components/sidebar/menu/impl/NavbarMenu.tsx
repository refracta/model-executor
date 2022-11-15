import React from 'react';
import {Container, Navbar} from "react-bootstrap";

interface Props {
    handleToggleSidebar: (value: boolean) => void
}

function NavbarMenu({handleToggleSidebar}: Props) {
    return (<Navbar id="main-navbar" expand="md">
        <Container>
            <Navbar.Brand href="#">Model executor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => handleToggleSidebar(true)}/>
        </Container>
    </Navbar>);
}

export default NavbarMenu;