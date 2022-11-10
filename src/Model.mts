import * as fs from 'fs';
import {Stats} from 'fs';
import Database from "./Database.mjs";

let db = Database.Instance;

type UniqueNameMap = {
    [key: string]: string
}


class Model {
    public readonly path: string;
    public readonly hierarchy: string[];
    public readonly name: string;
    public readonly deployScriptPath: string;
    public readonly undeployScriptPath: string;
    public readonly configPath: string;

    private constructor(path: string) {
        this.path = path;
        this.hierarchy = path.split('/').slice(1);
        this.name = this.hierarchy[this.hierarchy.length - 1];
        this.deployScriptPath = this.path + '/' + 'deploy.sh';
        this.undeployScriptPath = this.path + '/' + 'undeploy.sh';
        this.configPath = this.path + '/' + 'config.json';
    }

    static getModels(path: string = 'models' + '/'): Model[] {
        let models: Model[] = [];
        let dir: string[] = fs.readdirSync(path);
        if (dir.includes('config.json')) {
            return [new Model(path.slice(0, -1))];
        }
        for (let file of dir) {
            let currentPath: string = path + file;
            let fileStats: Stats = fs.lstatSync(currentPath);
            if (fileStats.isDirectory()) {
                models = [...models, ...this.getModels(currentPath + '/')];
            }
        }
        return models;
    }

    static getUniqueNameMap(models: Model[] = Model.getModels()): UniqueNameMap {
        let nameMap: UniqueNameMap = {};
        let nameCountMap: { [uniqueName: string]: number } = {};
        for (let m of models) {
            if (m.name in nameCountMap) {
                let currentName = m.name + '-' + nameCountMap[m.name]++;
                nameMap[currentName] = m.path;
                nameMap[m.path] = currentName;
            } else {
                nameCountMap[m.name] = 1;
                nameMap[m.name] = m.path;
                nameMap[m.path] = m.name;
            }
        }
        return nameMap;
    }

    public get config(): object {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    public get data() {
        return db.getModelData(this.path);
    }

    public set data(data) {
        db.setModelData(this.path, data);
    }
}

export default Model;