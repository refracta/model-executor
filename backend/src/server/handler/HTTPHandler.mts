import Database from "../../Database.mjs";
import Model from "../../Model.mjs";
import HTTPServer from "../HTTPServer.mjs";
import {Request, Response} from "express";
import multer from 'multer';

let db = Database.Instance;

const upload = multer({dest: 'uploads/'});

type ModelMap = { [index: string]: Model };

class HTTPHandler {
    private models: Model[] = Model.getModels();
    private uniqueNameMap = Model.getUniqueNameMap(this.models);
    private modelMap: ModelMap = this.models.reduce((map: ModelMap, m: Model) => (map[m.path] = map[this.uniqueNameMap[m.path]] = m, map), {});

    public initRoute(httpServer: HTTPServer) {
        httpServer.app.get('/', (req: Request, res: Response) => {
            res.send('Hello World!!');
        });

        httpServer.app.get('/api/models', (req: Request, res: Response) => {
            res.json(this.models.map(m => ({
                hierarchy: m.hierarchy,
                name: m.name,
                uniqueName: this.uniqueNameMap[m.path],
                status: m.data.status
            })));
        });

        httpServer.app.get('/api/model/:uniqueName', (req: Request, res: Response) => {
            let uniqueName = req.params.uniqueName;
            let model = this.modelMap[uniqueName];

            res.json({
                path: model.path,
                hierarchy: model.hierarchy,
                name: model.name,
                uniqueName: this.uniqueNameMap[model.path],
                config: model.config,
                status: model.data.status
            });
        });

        httpServer.app.post('/api/upload', upload.array('files'), function (req, res, next) {
            // req.body는 텍스트 필드를 포함합니다.
            console.log(req);
        });
    }
}

export default HTTPHandler;