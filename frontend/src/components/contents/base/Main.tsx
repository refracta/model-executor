import React from 'react';
import NavbarMenu from "../../sidebar/menu/impl/NavbarMenu";
import {AppProps} from "../../../types/Types";
import {Route, Routes} from "react-router-dom";
import Model from "../Model";
import History from "../History";
import Setting from "../Setting";

type Props = {
    setToggled: (value: boolean) => void
} & AppProps;

export default function Main({context, setToggled}: Props) {
    return (<main>
        <NavbarMenu setToggled={setToggled}></NavbarMenu>
        <Routes>
            <Route path='/model/*' element={context.path.startsWith('model/') ? <Model context={context}/> : <></>}/>
            <Route path='/history/*'
                   element={context.path.startsWith('history/') ? <History context={context}/> : <></>}/>
            <Route path='/setting/*' element={<Setting context={context}/>}/>
        </Routes>
    </main>);
}
