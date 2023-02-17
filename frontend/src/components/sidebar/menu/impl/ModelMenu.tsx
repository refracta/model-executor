import React, {ReactElement} from 'react';
import {MenuItem, SubMenu} from "react-pro-sidebar";
import {Link} from "react-router-dom";
import {FaStar} from "react-icons/fa";
import {AppContext, AppProps, ModelData, ModelStatus} from "../../../../types/Types";

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

function menuify(renderHierarchy: { [key: string | symbol]: any }, uniqueName?: string, current: string = '', pathKey: string = ''): ReactElement {
    pathKey = current ? pathKey + '/' + current : current;
    let keys = Object.keys(renderHierarchy);
    if (Symbol.for('model') in renderHierarchy) {
        let model: ModelData = renderHierarchy[Symbol.for('model')];

        return <MenuItem icon={<FaStar/>} active={model.uniqueName == uniqueName}
                         suffix={toBadge(model.status)}
                         key={pathKey}>{model.configName}
            <Link to={`/model/${model.uniqueName}`}/>
        </MenuItem>;
    } else {
        let children = keys.map(key => menuify(renderHierarchy[key], uniqueName, key, pathKey));
        if (!current) {
            return <>{children}</>;
        } else {
            return <SubMenu defaultOpen={true} key={pathKey} title={current}>
                {children}
            </SubMenu>;
        }
    }
}

type Props = {modelUniqueName?: string} & AppProps;

export default function ModelMenu({context, modelUniqueName}: Props) {
    let renderHierarchy = toRenderHierarchy(context.models);
    return menuify(renderHierarchy, modelUniqueName);
}
