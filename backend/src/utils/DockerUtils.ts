import Docker, {Container, ContainerInfo, Exec} from "dockerode";

export default class DockerUtils {
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