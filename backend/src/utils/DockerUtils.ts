import * as fs from 'fs';
import Docker, {Container, ContainerInfo, Exec} from "dockerode";

class DockerUtils {
    public static async getContainerByName(docker: Docker, name: string): Promise<{ container: Container, containerInfo: ContainerInfo }> {
        let containers = await docker.listContainers({all: true});
        let containerInfo = containers.find(c => c.Names.some(n => n === '/' + name)) as ContainerInfo;
        let container = docker.getContainer(containerInfo.Id);
        return {container, containerInfo};
    }

    public static exec(container: Container, command: string) {
        return new Promise(resolve => {
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
}

export default DockerUtils;
/*
import DockerUtils, {ContainerInfo, Exec} from "dockerode";
import tar from "tar";

let docker = new DockerUtils({host: 'abstr.net', port: 30001});
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
