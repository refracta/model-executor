import WSManager from "../../sender/WSManager";
import {DefaultWSocket, WSMessageType} from "../../../types/Types";
import Model from "../../../Model";


export default class DefaultWSManager extends WSManager {
    public json(data: any, sockets: DefaultWSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    public getAllSockets() {
        return this.server?.sockets as DefaultWSocket[];
    }

    public getModelSockets(model: Model) {
        return this.server?.sockets.filter(s => s.data.path?.startsWith(`model/${model.uniqueName}`));
    }

    public sendUpdateModel(model: Model, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.UpdateModel, model: model.toFullData()}, sockets);
    }

    public sendUpdateModels(models: Model[] = Model.getModels(), sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({
            msg: WSMessageType.UpdateModels,
            models: models.map(m => m.toSimpleData())
        }, sockets);
    }
}