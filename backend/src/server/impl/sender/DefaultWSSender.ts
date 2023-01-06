import WSSender from "../../sender/WSSender";
import {DefaultWSocket, IWSocket} from "../../../types/Types";
import Model from "../../../Model";


export default class DefaultWSSender extends WSSender {
    public json(data: any, sockets: DefaultWSocket[] = this.server?.sockets as DefaultWSocket[]) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    public sendUpdateModel(model: Model, sockets: DefaultWSocket[] = this.server?.sockets.filter(s => s.data.path?.startsWith(`model/${model.uniqueName}`)) as DefaultWSocket[]) {
        this.json({msg: 'UpdateModel', model: model.toFullData()}, sockets);
    }

    public sendUpdateModels(models: Model[] = Model.getModels(), sockets: DefaultWSocket[] = this.server?.sockets as DefaultWSocket[]) {
        this.json({
            msg: 'UpdateModels',
            models: models.map(m => m.toSimpleData())
        }, sockets);
    }
}