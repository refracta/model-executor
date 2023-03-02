import React from 'react';
import {Container, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";

interface Props {
    setToggled: (value: boolean) => void
}

export default function NavbarMenu({setToggled}: Props) {
    return <Navbar id="main-navbar" expand="md" variant="dark">
        <Container>
            <Navbar.Brand href="#home">
                <Link to='/' style={{textDecoration: 'none', color: 'white'}}>Model executor</Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setToggled(true)}/>
        </Container>
    </Navbar>;
}
