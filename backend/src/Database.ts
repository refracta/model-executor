import {JSONFileSync, LowSync} from "@commonify/lowdb"
import {ModelStatus, Data, HistoryData, ModelData, Models} from "./types/Types";
import fs from "fs";

export default class Database {
    private static instance: Database;
    private static adapter: JSONFileSync<Data>;
    private static db: LowSync<Data>;

    static get Instance() {
        return this.instance || (this.instance = new this());
    }

    static async init(adapter: JSONFileSync<Data>, force: boolean = false) {
        Database.adapter = adapter;
        Database.db = new LowSync<Data>(Database.adapter);
        Database.db.read();
        if (force) {
            Database.db.data = {models: {}, histories: []};
        } else {
            Database.db.data ||= {models: {}, histories: []};
        }
        Database.db.write();
    }

    getModelData(path: string): ModelData {
        let models: Models = Database.db.data?.models as Models;
        let modelData: ModelData;
        if (!models[path]) {
            models[path] = {status: ModelStatus.OFF};
            Database.db.write();
        }
        modelData = models[path];
        return modelData;
    }

    setModelData(path: string, modelData: ModelData) {
        let models: Models = Database.db.data?.models as Models;
        models[path] = modelData;
        Database.db.write();
    }

    getHistories(): HistoryData[] {
        return Database.db.data?.histories as HistoryData[];
    }

    getHistoryData(index: number): HistoryData {
        let histories: HistoryData[] = this.getHistories();
        return histories[index];
    }

    setHistoryData(index: number, data: HistoryData) {
        let histories: HistoryData[] = this.getHistories();
        histories[index] = data;
        Database.db.write();
    }

    addHistoryData(historyData: HistoryData): number {
        let histories: HistoryData[] = this.getHistories();
        historyData = {...historyData, number: histories.length + 1};
        histories.push(historyData);
        Database.db.write();
        return histories.length - 1;
    }
}
(async () => {
    if (!fs.existsSync('database')) {
        await fs.mkdirSync('database');
    }
    await Database.init(new JSONFileSync<Data>('database/db.json'));
})();