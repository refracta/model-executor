import React, {ReactElement} from 'react';
import {MenuItem, SubMenu} from "react-pro-sidebar";
import {Link} from "react-router-dom";
import {FaStar} from "react-icons/fa";
import {AppData, ModelData} from "../../../../types/Types";
// {/*<MenuItem suffix={<span className="badge green">Running</span>}>1 </MenuItem>*/}
// {/*<MenuItem suffix={<span className="badge yellow">Deploying</span>}>2 </MenuItem>*/}
// {/*<MenuItem suffix={<span className="badge red">Undeploying</span>}>2 </MenuItem>*/}

function toRenderHierarchy(models: ModelData[]): { [key: string | symbol]: any } {
    let renderHierarchy: { [key: string | symbol]: any } = {};
    for (let m of models) {
        let {hierarchy} = m;
        let currentHierarchy = renderHierarchy;
        for (let h of hierarchy.slice(0, -1)) {
            currentHierarchy = currentHierarchy[h] = {...currentHierarchy[h]};
        }
        currentHierarchy[hierarchy[hierarchy.length - 1]] = {[Symbol.for('model')]: m};
    }
    return renderHierarchy;
}

function toBadge(status: string) {
    switch (status) {
        case 'deploying':
            return (<span className="badge yellow">Deploying</span>);
        case 'undeploying':
            return (<span className="badge blue">Undeploying</span>);
        case 'running':
            return (<span className="badge green">Running</span>);
        case 'error':
            return (<span className="badge red">Error</span>);
        case 'off':
        default:
            return (<></>);
    }
}

function menuify(renderHierarchy: { [key: string | symbol]: any }, uniqueName?: string, current: string = '', pathKey: string = ''): ReactElement {
    pathKey = current ? pathKey + '/' + current : current;
    let keys = Object.keys(renderHierarchy);
    if (Symbol.for('model') in renderHierarchy) {
        let model: ModelData = renderHierarchy[Symbol.for('model')];

        return (<MenuItem icon={<FaStar/>} active={model.uniqueName == uniqueName}
                          suffix={toBadge(model.status)}
                          key={pathKey}>{model.name}<Link to={`/model/${model.uniqueName}`}></Link></MenuItem>);
    } else {
        let children = keys.map(key => menuify(renderHierarchy[key], uniqueName, key, pathKey));
        if (!current) {
            return (
                <>
                    {children}
                </>
            );
        } else {
            return (
                <SubMenu defaultOpen={true} key={pathKey} title={current}>
                    {children}
                </SubMenu>
            );
        }
    }
}

interface Props {
    data: AppData,
    modelUniqueName?: string
    // for fast interactive reaction
}

export default function ModelMenu({data, modelUniqueName}: Props) {
    let renderHierarchy = toRenderHierarchy(data.models);
    return menuify(renderHierarchy, modelUniqueName);
}
