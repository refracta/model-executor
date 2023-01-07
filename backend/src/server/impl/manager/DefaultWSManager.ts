import WSManager from "../../manager/WSManager";
import {DefaultWSocket, WSMessageType} from "../../../types/Types";
import Model from "../../../Model";


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

    sendUpdateModel(model: Model, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.UpdateModel, model: model.toFullData()}, sockets);
    }

    sendUpdateModels(models: Model[] = Model.getModels(), sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({
            msg: WSMessageType.UpdateModels,
            models: models.map(m => m.toSimpleData())
        }, sockets);
    }
}