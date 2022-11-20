import * as fs from 'fs';
import Docker, {ContainerInfo, Exec} from "dockerode";

class DockerController {
    public async getContainer(docker:Docker){
        let containers = await docker.listContainers();
        let containerInfo = containers.find(c => c.Names.some(n => n.includes('/test'))) as ContainerInfo;
        let container = docker.getContainer(containerInfo.Id);
    }
}

export default DockerController;
/*
import DockerController, {ContainerInfo, Exec} from "dockerode";
import tar from "tar";

let docker = new DockerController({host: 'abstr.net', port: 30001});
!async function () {
    let containers = await docker.listContainers();
    let containerInfo = containers.find(c => c.Names.some(n => n.includes('/test'))) as ContainerInfo;
    let container = docker.getContainer(containerInfo.Id);
    /!*    container.exec({
            Cmd: ['/bin/bash', '-c', 'base64 -d > testrun'],
            AttachStdin: true,
            AttachStdout: true
        }, function (err, exec) {
            (exec as Exec).start({hijack: true, stdin: true}, function (err, stream) {
                fs.createReadStream('cc', 'base64').pipe(stream as any);
                docker.modem.demuxStream(stream as any, process.stdout, process.stderr);
            });
        });*!/
    console.log('exec');
    await tar.c(
        {
            gzip: true,
            file: 'controller.tar'
        },
        ['controller-linux']
    );
    await container.putArchive('controller.tar', {path: '/'});
    container.exec({
        Cmd: ['/bin/bash', '-c', 'chmod 777 controller-linux && ./controller-linux'],
        AttachStdin: true,
        AttachStdout: true
    }, function (err, exec) {
        (exec as Exec).start({hijack: true, stdin: true}, function (err, stream) {
            docker.modem.demuxStream(stream as any, process.stdout, process.stderr);
        });
    });
    // console.log(container);
}();*/
