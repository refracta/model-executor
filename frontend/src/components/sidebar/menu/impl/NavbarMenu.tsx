import React from 'react';
import {Container, Navbar} from "react-bootstrap";

interface Props {
    setToggled: (value: boolean) => void
}

function NavbarMenu({setToggled}: Props) {
    return (<Navbar id="main-navbar" expand="md">
        <Container>
            <Navbar.Brand href="#">Model executor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setToggled(true)}/>
        </Container>
    </Navbar>);
}

export default NavbarMenu;