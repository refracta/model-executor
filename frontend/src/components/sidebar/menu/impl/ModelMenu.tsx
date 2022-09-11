import React, {useState, useEffect, ReactNode, ReactElement} from 'react';
import {Menu, MenuItem, SubMenu} from "react-pro-sidebar";
import {Mode} from "fs";
import {Link} from "react-router-dom";
import {FaStar} from "react-icons/fa";
// {/*<MenuItem suffix={<span className="badge green">Running</span>}>1 </MenuItem>*/}
// {/*<MenuItem suffix={<span className="badge yellow">Deploying</span>}>2 </MenuItem>*/}
// {/*<MenuItem suffix={<span className="badge red">Undeploying</span>}>2 </MenuItem>*/}
type Model = {
    path: string,
    hierarchy: string[],
    name: string,
    uniqueName: string,
    config: string,
    status: string
}

function toRenderHierarchy(models: Model[]): { [key: string | symbol]: any } {
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

function menuify(renderHierarchy: { [key: string | symbol]: any }, current: string = '', pathKey: string = ''): ReactElement {
    pathKey = current ? pathKey + '/' + current : current;
    let keys = Object.keys(renderHierarchy);
    if (Symbol.for('model') in renderHierarchy) {
        let model: Model = renderHierarchy[Symbol.for('model')];
        if(model.name.includes('SRCNN')){
            return (<MenuItem icon={<FaStar/>} suffix={<span className="badge yellow">Deploying</span>} key={pathKey}>{model.name}<Link to={`/model/${model.uniqueName}`}></Link></MenuItem>);

        }
        if(model.uniqueName.includes('SRGAN')){
            return (<MenuItem icon={<FaStar/>} suffix={<span className="badge red">Undeploying</span>} key={pathKey}>{model.name}<Link to={`/model/${model.uniqueName}`}></Link></MenuItem>);

        }
        return (<MenuItem icon={<FaStar/>} suffix={<span className="badge green">Running</span>} key={pathKey}>{model.name}<Link to={`/model/${model.uniqueName}`}></Link></MenuItem>);
    } else {
        if (keys.length == 1 && Symbol.for('model') in renderHierarchy[keys[0]]) {
            return menuify(renderHierarchy[keys[0]], keys[0], pathKey);
        } else {
            let children = keys.map(key => menuify(renderHierarchy[key], key, pathKey));
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
}

function ModelMenu() {
    const [models, setModels]: [Model[], Function] = useState([]);
    useEffect(() => {
        (async () => {
            setModels(await fetch('/api/model').then(r => r.json()));
        })();
    }, []);

    let renderHierarchy = toRenderHierarchy(models);
    console.log('--------------------');
    return menuify(renderHierarchy);
}

export default ModelMenu;