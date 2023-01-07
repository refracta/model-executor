import Docker, {Container, ContainerInfo} from "dockerode";
import fs from "fs";
import {Duplex} from "stream";

export default class DockerUtils {
    static async getContainerByName(docker: Docker, name: string): Promise<{ container: Container, containerInfo: ContainerInfo }> {
        let containers = await docker.listContainers({all: true});
        let containerInfo = containers.find(c => c.Names.some(n => n === '/' + name)) as ContainerInfo;
        let container = (containerInfo ? docker.getContainer(containerInfo.Id) : undefined) as Container;
        // WARNING: 더 좋은 예외 처리 방법
        return {container, containerInfo};
    }

    static exec(container: Container, command: string) {
        return new Promise(resolve => {
            container.exec({
                Cmd: ['/bin/bash', '-c', command],
                AttachStdin: true,
                AttachStdout: true
            }, async (err, exec) => {
                let stream = await exec?.start({hijack: true, stdin: true});
                stream?.on('finish', resolve);
            });
        });
    }

    static uploadFile(docker: Docker, container: Container, localPath: string, remotePath: string) {
        return new Promise(resolve => {
            container.exec({
                Cmd: ['/bin/bash', '-c', 'base64 -d > ' + remotePath],
                AttachStdin: true,
                AttachStdout: true
            }, async (err, exec) => {
                exec?.start({hijack: true, stdin: true}, function (err, stream) {
                    let readStream = fs.createReadStream(localPath, 'base64');
                    readStream.pipe(stream as Duplex)
                    docker.modem.demuxStream(stream as Duplex, process.stdout, process.stderr);
                    stream?.on('finish', resolve);
                });
            });
        });
    }
}