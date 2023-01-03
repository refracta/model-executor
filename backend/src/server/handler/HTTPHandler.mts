import Database from "../../Database.mjs";
import Model from "../../Model.mjs";
import HTTPServer from "../HTTPServer.mjs";
import express, {NextFunction, Request, Response} from "express";
import multer from 'multer';
import PlatformServer from "../core/PlatformServer.mjs";
import Docker, {Container, ContainerInfo, Exec} from "dockerode";
import {IWSSocket} from "../types/Types.mjs";

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

        httpServer.app.post('/api/upload', upload.fields([{name: 'files'}, {name: 'modelUniqueName'}]), async function (req, res, next) {
            let modelUniqueName = req.body.modelUniqueName;
            let model = Model.getModel(req.body.modelUniqueName);
            let modelData = model.data;

            if (!(modelData.status === 'off' || modelData.status === 'error')) {
                res.json({status: 'fail'});
                return;
            } else {
                res.json({status: 'success'});
            }

            function setModelDataWithUpdateModels(modelData: any, sockets: IWSSocket[] = PlatformServer.wsServer.sockets) {
                model.data = {...model.data, ...modelData};
                let rawModels = Model.getModels();
                let models = rawModels.map(m => m.toSimpleData());
                sockets.forEach(s => s.send(JSON.stringify({
                    msg: 'UpdateModels',
                    models
                })));
            }

            let files = req.files as { [fieldName: string]: File[] };
            let file = files['files'][0];
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            file.webpath = ['', ...file.path.split(/[/\\]/g)].join('/');
            let history = {
                modelPath: model.path,
                inputPath: file?.path,
                inputInfo: file
            };
            model.data = {...model.data, historyIndex: Database.Instance.addHistoryData(history)};

            setModelDataWithUpdateModels({status: 'deploying'});

            let config = model.config;
            let docker = new Docker(config.dockerServer ? config.dockerServer : PlatformServer.config.defaultDockerServer);
            let containers = await docker.listContainers({all: true});
            let containerInfo = containers.find(c => c.Names.some(n => n === '/' + config.container)) as ContainerInfo;
            if (containerInfo) {
                let container = docker.getContainer(containerInfo.Id);
                async function exec(command:string){
                    await new Promise(resolve => {
                        container.exec({
                            Cmd: ['/bin/bash', '-c', command],
                            AttachStdin: true,
                            AttachStdout: true
                        }, async function (err, exec) {
                            let stream = await (exec as Exec).start({hijack: true, stdin: true});
                            stream.on('finish', resolve);
                        });
                    });
                }
                try {
                    try {
                        if (containerInfo.State === 'running') {
                            await container.stop();
                        }
                    } catch (e) {
                    }
                    await container.start();
                    // await exec('rm -rf /opt/mctr');
                    await exec('mkdir -p /opt/mctr/{o,i}');
                    await container.putArchive('../controller/controller.tar', {path: '/opt/mctr/'});
                    await exec('rm -rf /opt/mctr/debug');
                    exec(`chmod 777 /opt/mctr/controller && /opt/mctr/controller ${PlatformServer.config.socketExternalHost} ${PlatformServer.config.socketPort} ${Buffer.from(model.path).toString('base64')} >> /opt/mctr/debug 2>&1`);
                    setModelDataWithUpdateModels({status: 'running'});
                } catch (e) {
                    setModelDataWithUpdateModels({status: 'error'});
                    console.error(e);
                    return;
                }
            } else {
                setModelDataWithUpdateModels({status: 'error'});
                return;
            }

            PlatformServer.wsServer.sockets.filter(s => s.data.path?.startsWith(`model/${modelUniqueName}`)).forEach(s => s.send(JSON.stringify({
                msg: 'UpdateModel',
                model: model.toFullData()
            })));
        });
    }
}

export default HTTPHandler;