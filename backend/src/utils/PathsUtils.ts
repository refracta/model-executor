import {Paths} from "../types/Types";

export default class PathsUtils {
    static DefaultPaths: Paths = {
        script: "/opt/mctr/run",
        input: "/opt/mctr/i/raw",
        inputInfo: "/opt/mctr/i/info",
        output: "/opt/mctr/o/raw",
        outputInfo: "/opt/mctr/o/info",
        outputDescription: "/opt/mctr/o/desc",
        controllerPath: "/opt/mctr/",
        debugLog: "/dev/null"
    };

    static getPaths(paths: Paths) {
        return {...this.DefaultPaths, ...paths};
    }
}
