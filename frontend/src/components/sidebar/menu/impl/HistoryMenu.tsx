import {FaStar} from "react-icons/fa";
import React from "react";
import {MenuItem} from "react-pro-sidebar";
import {Link} from "react-router-dom";
import {AppProps, ModelStatus} from "../../../../types/Types";

type Props = { historyNumber?: number } & AppProps;

function toBadge(status: string) {
    switch (status) {
        case ModelStatus.DEPLOYING:
            return <span className="badge yellow">Deploying</span>;
        case ModelStatus.UNDEPLOYING:
            return <span className="badge blue">Undeploying</span>;
        case ModelStatus.RUNNING:
            return <span className="badge green">Running</span>;
        case ModelStatus.ERROR:
            return <span className="badge red">Error</span>;
        case ModelStatus.OFF:
        default:
            return <></>;
    }
}
export default function HistoryMenu({context, historyNumber}: Props) {
    let histories = [...context.histories].reverse();
    return <>
        {histories.map(h => <MenuItem icon={<><FaStar/>{h.number}</>}
            active={h.number === historyNumber}
            suffix={toBadge(h.modelStatus as string)}
            key={h.number}
        > {h.modelName}
            <Link to={`/history/${h.number}`}/>
        </MenuItem>)}
    </>;
}
