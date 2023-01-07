import React from 'react';
import NavbarMenu from "../../sidebar/menu/impl/NavbarMenu";
import {AppData} from "../../../types/Types";
import {Route, Routes} from "react-router-dom";
import Model from "../Model";


interface Props {
    data: AppData,
    setToggled: (value: boolean) => void
}

export default function Main({data, setToggled}: Props) {
    return (<main>
        <NavbarMenu setToggled={setToggled}></NavbarMenu>
        <Routes>
            <Route path='/model/*' element={data.model ? <Model data={data}/> : <></>}/>
        </Routes>
    </main>);
}
