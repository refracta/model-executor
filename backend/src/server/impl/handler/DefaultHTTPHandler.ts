import Database from "../../../Database";
import Model from "../../../Model";
import HTTPServer from "../../HTTPServer";
import express, {Request, Response} from "express";
import multer from "multer";
import PlatformServer from "../../core/PlatformServer";
import Docker from "dockerode";
import DockerUtils from "../../../utils/DockerUtils";
import {HTTPHandler} from "../../../types/Interfaces";
import {ContainerStatus} from "../../../types/Types";

type File = Express.Multer.File & { webPath?: string };
const upload = multer({dest: 'resources/'});
export default class DefaultHTTPHandler implements HTTPHandler {
    initRoute(httpServer: HTTPServer) {
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

        httpServer.app.post('/api/upload', upload.fields([{name: 'files'}, {name: 'modelUniqueName'}]), async (req, res, next) => {
            let parameters;
            try {
                parameters = JSON.parse(req.body.parameters);
            } catch (e) {
                res.json({status: 'fail'});
                return;
            }

            let model = Model.getModel(req.body.modelUniqueName);
            let modelData = model.data;
            if (!(modelData.status === 'off' || modelData.status === 'error')) {
                res.json({status: 'fail'});
                return;
            } else {
                res.json({status: 'success'});
            }

            let files = req.files as { [fieldName: string]: File[] };
            let file = files['files'][0];
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            file.webPath = ['', ...file.path.split(/[/\\]/g)].join('/');
            let historyIndex = Database.Instance.addHistoryData({
                modelPath: model.path,
                inputPath: file?.path,
                inputInfo: file,
                parameters
            });
            model.data = {...model.data, status: ContainerStatus.DEPLOYING, historyIndex};
            PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
            PlatformServer.wsServer.manager.sendUpdateModels();

            let config = model.config;
            let docker = new Docker(config.dockerServer ? config.dockerServer : PlatformServer.config.defaultDockerServer);
            let {container, containerInfo} = await DockerUtils.getContainerByName(docker, config.container);
            if (!containerInfo) {
                model.data = {...model.data, status: ContainerStatus.ERROR};
                PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
                PlatformServer.wsServer.manager.sendUpdateModels();
                return;
            }

            try {
                await container.restart();
                // await DockerUtils.exec(container, 'rm -rf /opt/mctr'));
                await DockerUtils.exec(container, 'mkdir -p /opt/mctr/{o,i}');
                await container.putArchive('../controller/controller.tar', {path: '/opt/mctr/'});
                await DockerUtils.exec(container, 'rm -rf /opt/mctr/debug');
                setTimeout(async () => {
                    await DockerUtils.exec(container, `chmod 777 /opt/mctr/controller && /opt/mctr/controller ${PlatformServer.config.socketExternalHost} ${PlatformServer.config.socketPort} ${Buffer.from(model.path).toString('base64')} >> /opt/mctr/debug 2>&1`);
                });
                model.data = {...model.data, status: ContainerStatus.RUNNING};
            } catch (e) {
                console.error(e);
                model.data = {...model.data, status: ContainerStatus.ERROR};

            }
            PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
            PlatformServer.wsServer.manager.sendUpdateModels();
        });
    }
}