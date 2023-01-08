import * as fs from "fs";
import {Stats} from "fs";
import Database from "./Database";

let db = Database.Instance;

type UniqueNameMap = {
    [key: string]: string
}

type ModelMap = { [index: string]: Model };

export default class Model {
    static uniqueNameMap: UniqueNameMap;
    static modelMap: ModelMap;
    readonly path: string;
    readonly hierarchy: string[];
    readonly name: string;
    readonly configPath: string;

    static {
        Model.updateMaps();
    }

    private constructor(path: string) {
        this.path = path;
        this.hierarchy = path.split('/').slice(1);
        this.name = this.hierarchy[this.hierarchy.length - 1];
        this.configPath = this.path + '/' + 'config.json';
    }

    get config(): any {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    get data() {
        return db.getModelData(this.path);
    }

    set data(data) {
        db.setModelData(this.path, data);
    }

    get lastHistory() {
        return db.getHistoryData(this.data.historyIndex as number);
    }

    set lastHistory(data) {
        db.setHistoryData(this.data.historyIndex as number, data);
    }

    get uniqueName() {
        return Model.uniqueNameMap[this.path];
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

    static updateMaps() {
        let models = Model.getModels();
        this.uniqueNameMap = Model.getUniqueNameMap(models);
        this.modelMap = Model.getModelMap(models, this.uniqueNameMap);
    }

    static getModel(uniqueNameOrPath: string): Model {
        return this.modelMap[uniqueNameOrPath];
    }

    // TODO: 이상한 모델 이름을 필터하거나, 맵핑을 고유하게 가질 수 있도록 분리
    private static getUniqueNameMap(models: Model[] = Model.getModels()): UniqueNameMap {
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

    private static getModelMap(models: Model[] = Model.getModels(), uniqueNameMap: UniqueNameMap = Model.getUniqueNameMap(models)): ModelMap {
        return models.reduce((map: ModelMap, m: Model) => (map[m.path] = map[uniqueNameMap[m.path]] = m, map), {})
    }

    toSimpleData() {
        return {
            hierarchy: this.hierarchy,
            name: this.name,
            configName: this.config.name,
            uniqueName: this.uniqueName,
            status: this.data.status
        };
    }

    toFullData() {
        return {
            ...this.toSimpleData(),
            config: this.config,
            lastHistory: this.lastHistory
        }
    }
}