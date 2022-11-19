import Database from "../../Database.mjs";
import Model from "../../Model.mjs";
import HTTPServer from "../HTTPServer.mjs";
import express, {NextFunction, Request, Response} from "express";
import multer from 'multer';
import PlatformServer from "../core/PlatformServer.mjs";

type File = Express.Multer.File & { webpath?: string };
let db = Database.Instance;

const upload = multer({dest: 'resources/'});


class HTTPHandler {
    public initRoute(httpServer: HTTPServer) {
        httpServer.app.get('/', (req: Request, res: Response) => {
            res.send('Hello World!!');
        });

        httpServer.app.use('/resources', express.static('resources'));

        httpServer.app.get('/api/models', (req: Request, res: Response) => {
            let models = Model.getModels();
            res.json(models.map(m => m.toSimpleData()));
        });

        httpServer.app.get('/api/model/:uniqueName', (req: Request, res: Response) => {
            let uniqueName = req.params.uniqueName;
            let model = Model.getModel(uniqueName);
            res.json(model.toFullData());
        });

        httpServer.app.post('/api/upload', upload.fields([{name: 'files'}, {name: 'modelUniqueName'}]), function (req, res, next) {
            let modelUniqueName = req.body.modelUniqueName;
            let model = Model.getModel(req.body.modelUniqueName);
            if (model.data.status !== 'off') {
                res.json({status: 'fail'});
                return;
            } else {
                res.json({status: 'success'});
            }

            let modelData = model.data;
            modelData.status = 'deploying';
            let files = req.files as { [fieldName: string]: File[] };
            let file = files['files'][0];
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            file.webpath = ['', ...file.path.split(/[/\\]/g)].join('/')

            let history = {
                modelPath: model.path,
                inputPath: file?.path,
                inputInfo: file
            };
            modelData.historyIndex = Database.Instance.addHistoryData(history);

            model.data = modelData;
            let rawModels = Model.getModels();
            let models = rawModels.map(m => m.toSimpleData());

            PlatformServer.wsServer.sockets.forEach(s => s.send(JSON.stringify({
                msg: 'UpdateModels',
                models
            })));

            PlatformServer.wsServer.sockets.filter(s => s.data.path?.startsWith(`model/${modelUniqueName}`)).forEach(s => s.send(JSON.stringify({
                msg: 'UpdateModel',
                model: model.toFullData()
            })));
        });
    }
}

export default HTTPHandler;