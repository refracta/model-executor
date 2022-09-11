import {LowSync, JSONFileSync, Adapter} from 'lowdb'
import Model from "./Model.mjs";

type ModelData = {
    status: string
}
type Models = {
    [index: string]: ModelData
}
type HistoryData = {}
type Data = {
    models: Models,
    histories: HistoryData[]
}

class Database {
    private static instance: Database;

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    private static adapter: JSONFileSync<Data>;
    private static db: LowSync<Data>;

    public static async init(adapter: JSONFileSync<Data>) {
        Database.adapter = adapter;
        Database.db = new LowSync<Data>(Database.adapter);
        Database.db.read();
        Database.db.data ||= {models: {}, histories: []};
        Database.db.write();
    }

    public getModelData(path: string): ModelData {
        let models: Models = Database.db.data?.models as Models;
        let modelData: ModelData;
        if (!models[path]) {
            models[path] = {status: 'off'};
            Database.db.write();
        }
        modelData = models[path];
        return modelData;
    }

    public setModelData(path: string, modelData: ModelData) {
        let models: Models = Database.db.data?.models as Models;
        models[path] = modelData;
        Database.db.write();
    }
}

await Database.init(new JSONFileSync<Data>('db.json'));

export default Database;