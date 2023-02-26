import {Card} from 'react-bootstrap';
import React from "react";

let LoadedCardBody = Card.Body;
let SavedCardBody = (LoadedCardBody as any).OriginalCardBody;
let OriginalCardBody = SavedCardBody ? SavedCardBody : LoadedCardBody;

function MarginCardBody(props: any) {
    return <>{React.createElement(OriginalCardBody, props,
        <div className='p-md-3' style={{height: 'inherit'}}>
            {props.children}
        </div>
    )}</>;
}

(MarginCardBody as any).OriginalCardBody = OriginalCardBody;
export default MarginCardBody;
