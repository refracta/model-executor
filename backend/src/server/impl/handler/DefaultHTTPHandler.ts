import Database from "../../../Database";
import Model from "../../../Model";
import HTTPServer from "../../HTTPServer";
import express, {Request, Response} from "express";
import multer from "multer";
import PlatformServer from "../../core/PlatformServer";
import Docker from "dockerode";
import DockerUtils from "../../../utils/DockerUtils";
import {HTTPHandler} from "../../../types/Interfaces";
import {Data, ModelStatus} from "../../../types/Types";
import {JSONFileSync} from "@commonify/lowdb";
import fs from "fs";
import PathsUtils from "../../../utils/PathsUtils";

type File = Express.Multer.File;
let db = Database.Instance;
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

        httpServer.app.get('/api/histories', (req: Request, res: Response) => {
            let histories = db.getHistories().map((h) => {
                let model = Model.getModel(h.modelPath);
                let isLastHistory = model?.data.historyIndex === h.number as number - 1;
                let simpleHistory = {
                    number: h.number,
                    modelName: h.modelName,
                    modelStatus: isLastHistory ? model.data.status : ModelStatus.OFF
                }
                return simpleHistory;
            });

            res.json(histories);
        });

        httpServer.app.get('/api/history/:historyNumber', (req: Request, res: Response) => {
            let historyNumber = parseInt(req.params.historyNumber);
            let history = db.getHistoryData(historyNumber - 1);
            let model = Model.getModel(history.modelPath);
            let isLastHistory = model?.data.historyIndex === history.number as number - 1;
            res.json({...history, modelStatus: isLastHistory ? model.data.status : ModelStatus.OFF});
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
            let config = model.config;
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
            let historyIndex = Database.Instance.addHistoryData({
                modelName: model.config.name,
                modelExplain: model.config.explain,
                modelPath: model.path,
                inputPath: file?.path.replace(/\\/gi, '/'),
                inputInfo: {
                    originalName: file.originalname,
                    type: file.mimetype,
                    size: file.size
                },
                parameters,
                inputModule: config.input.module,
                outputModule: config.output.module,
                time: new Date()
            });
            model.data = {...model.data, status: ModelStatus.DEPLOYING, historyIndex};
            PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
            PlatformServer.wsServer.manager.sendUpdateModels();
            PlatformServer.wsServer.manager.sendUpdateHistory(model.lastHistory, PlatformServer.wsServer.manager.getHistorySockets(model.lastHistory));
            PlatformServer.wsServer.manager.sendUpdateHistories();

            let docker = new Docker(PlatformServer.getDockerServer(config.dockerServer));
            let {container, containerInfo} = await DockerUtils.getContainerByName(docker, config.container);
            if (!containerInfo) {
                model.data = {...model.data, status: ModelStatus.ERROR};
                PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
                PlatformServer.wsServer.manager.sendUpdateModels();
                PlatformServer.wsServer.manager.sendUpdateHistories();
                return;
            }

            try {
                await container.restart();
                // await DockerUtils.exec(container, 'rm -rf /opt/mctr'));
                let paths = PathsUtils.getPaths(config.input.paths);
                // WARNING: Injection
                await DockerUtils.exec(container, `mkdir -p "${paths.controllerPath}"`);
                let controllerArchive = PlatformServer.config.controller ? PlatformServer.config.controller : '../controller/controller.tar';
                await container.putArchive(controllerArchive, {path: paths.controllerPath});
                await DockerUtils.exec(container, `rm -rf "${paths.input}"`);
                await DockerUtils.exec(container, `rm -rf "${paths.inputInfo}"`);
                await DockerUtils.exec(container, `rm -rf "${paths.output}"`);
                await DockerUtils.exec(container, `rm -rf "${paths.outputInfo}"`);
                await DockerUtils.exec(container, `rm -rf "${paths.outputDescription}"`);
                setTimeout(async () => {
                    await DockerUtils.exec(container, `chmod 777 "${paths.controllerPath}/controller" && "${paths.controllerPath}/controller" ${PlatformServer.config.socketExternalHost} ${PlatformServer.config.socketPort} ${Buffer.from(model.path).toString('base64')} >> ${paths.debugLog} 2>&1`);
                });
                model.data = {...model.data, status: ModelStatus.RUNNING};
            } catch (e) {
                console.error(e);
                model.data = {...model.data, status: ModelStatus.ERROR};
            }
            PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
            PlatformServer.wsServer.manager.sendUpdateModels();
            PlatformServer.wsServer.manager.sendUpdateHistories();
        });

        httpServer.app.get('/api/setting/stop', async (req: Request, res: Response) => {
            let models = Model.getModels();
            let count = 0;
            for (let model of models) {
                let config = model.config;
                try {
                    let docker = new Docker(PlatformServer.getDockerServer(config.dockerServer));
                    let {container, containerInfo} = await DockerUtils.getContainerByName(docker, config.container);
                    console.log(`Stop ${config.container} container...`);
                    if (containerInfo.State !== 'exited') {
                        await container.stop();
                    }
                    let modelData = model.data;
                    modelData.status = ModelStatus.OFF;
                    count++;
                    console.log(`Stop ${config.container} container -> Success!`);
                } catch (e) {
                    console.log(`Stop ${config.container} container -> Fail...`, e);
                }
            }
            res.json({msg: 'success', result: `Stopped ${count}/${models.length} containers!`});
        });

        httpServer.app.get('/api/setting/clear-database', async (req: Request, res: Response) => {
            fs.unlinkSync('db.json');
            await Database.init(new JSONFileSync<Data>('db.json'));
            res.json({msg: 'success', result: `Clear database success!`});
        });

        httpServer.app.get('/api/setting/clear-resources', async (req: Request, res: Response) => {
            fs.rmSync('resources', {recursive: true, force: true});
            fs.mkdirSync('resources');
            res.json({msg: 'success', result: `Clear resources success!`});
        });

        httpServer.app.get('/api/setting/reload-config', async (req: Request, res: Response) => {
            PlatformServer.loadConfig();
            PlatformServer.close();
            PlatformServer.listen();
            res.json({msg: 'success', result: `Reload config success!`});
        });
    }
}