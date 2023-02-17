import WSManager from "../../manager/WSManager";
import {DefaultWSocket, HistoryData, ModelStatus, WSMessageType} from "../../../types/Types";
import Model from "../../../Model";
import {Request, Response} from "express";
import Database from "../../../Database";

export default class DefaultWSManager extends WSManager {
    json(data: any, sockets: DefaultWSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    getAllSockets() {
        return this.server?.sockets as DefaultWSocket[];
    }

    getModelSockets(model: Model) {
        return this.server?.sockets.filter(s => s.data.path?.startsWith(`model/${model.uniqueName}`));
    }

    getHistorySockets(history: HistoryData) {
        return this.server?.sockets.filter(s => s.data.path?.startsWith(`history/${history.number}`));
    }

    sendUpdateModel(model: Model, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.UpdateModel, model: model.toFullData()}, sockets);
    }

    sendUpdateModels(models: Model[] = Model.getModels(), sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({
            msg: WSMessageType.UpdateModels,
            models: models.map(m => m.toSimpleData())
        }, sockets);
    }

    sendUpdateHistory(history: HistoryData, sockets: DefaultWSocket[] = this.getAllSockets()) {
        let model = Model.getModel(history.modelPath);
        let isLastHistory = model?.data.historyIndex === history.number as number - 1;
        this.json({
            msg: WSMessageType.UpdateHistory,
            history: {...history, modelStatus: isLastHistory ? model.data.status : ModelStatus.OFF}
        }, sockets);
    }

    sendUpdateHistories(histories: HistoryData[] = Database.Instance.getHistories(), sockets: DefaultWSocket[] = this.getAllSockets()) {
        let simpleHistories = Database.Instance.getHistories().map(h => {
            let model = Model.getModel(h.modelPath);
            let isLastHistory = model?.data.historyIndex === h.number as number - 1;
            let simpleHistory = {
                number: h.number,
                modelName: h.modelName,
                modelStatus: isLastHistory ? model.data.status : ModelStatus.OFF
            }
            return simpleHistory;
        });
        this.json({
            msg: WSMessageType.UpdateHistories, histories: simpleHistories
        }, sockets);
    }

    sendTerminal(data: string, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({
            msg: WSMessageType.Terminal,
            data
        }, sockets);
    }
}