import Database from "../../Database.mjs";
import Model from "../../Model.mjs";
import HTTPServer from "../HTTPServer.mjs";
import {Request, Response} from "express";
import SocketServer from "../SocketServer.mjs";
import WSServer from "../WSServer.mjs";

let db = Database.Instance;

class HTTPHandler {
    private models: Model[] = Model.getModels();
    private uniqueNameMap = Model.getUniqueNameMap(this.models);

    public initRoute(httpServer: HTTPServer) {
        httpServer.app.get('/', (req: Request, res: Response) => {
            res.send('Hello World!!');
        });

        httpServer.app.get('/api/model', (req: Request, res: Response) => {
            res.json(this.models.map(m => ({
                path: m.path,
                hierarchy: m.hierarchy,
                name: m.name,
                uniqueName: this.uniqueNameMap[m.path],
                config: m.config,
                status: m.data.status
            })));
        });
    }
}

export default HTTPHandler;