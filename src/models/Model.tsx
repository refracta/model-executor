import * as fs from 'fs';
import {Stats} from 'fs';
import {sep} from 'path';

class Model {
    private readonly path: string;

    private constructor(path: string) {
        this.path = path;
    }

    static getModels(path: string = 'models' + sep): Array<Model> {
        let models: Array<Model> = [];
        let dir: Array<string> = fs.readdirSync(path);
        if (dir.includes('config.json')) {
            return [new Model(path)];
        }
        for (let file of dir) {
            let currentPath: string = path + file;
            let fileStats: Stats = fs.lstatSync(currentPath);
            if (fileStats.isDirectory()) {
                models = [...models, ...this.getModels(currentPath + sep)];
            }
        }
        return models;
    }

    public get deployScriptPath(): string {
        return this.path + sep + 'deploy.sh';
    }

    public get undeployScriptPath(): string {
        return this.path + sep + 'deploy.sh';
    }

    public get configPath(): string {
        return this.path + sep + 'config.json';
    }

    public get config(): object {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
}

export default Model;