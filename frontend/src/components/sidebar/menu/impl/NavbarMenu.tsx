import React from 'react';
import {Container, Navbar} from "react-bootstrap";

interface Props {
    setToggled: (value: boolean) => void
}

export default function NavbarMenu({setToggled}: Props) {
    return <Navbar id="main-navbar" expand="md" variant="dark">
        <Container>
            <Navbar.Brand href="#home">
                Model executor
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setToggled(true)}/>
        </Container>
    </Navbar>;
}
