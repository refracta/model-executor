import express from 'express';
import Model from "./Model.mjs";
import Database from "./Database.mjs";

let db = Database.Instance;

interface UniqueNameMap {

}

class App {
    public application: express.Application;
    private models: Model[] = Model.getModels();
    private uniqueNameMap = Model.getUniqueNameMap(this.models);
    // RELOAD CLIENT USER DOWN
    // N초 뒤에 컨테이너 날리기?

    constructor() {
        this.application = express();
        this.router();
    }

    private router(): void {
        this.application.get('/', (req: express.Request, res: express.Response) => {
            res.send('Hello World!!');
        });
        this.application.get('/api/model', (req: express.Request, res: express.Response) => {
            res.json(this.models.map(m => ({
                path: m.path,
                hierarchy: m.hierarchy,
                name: m.name,
                uniqueName: this.uniqueNameMap[m.path],
                config: m.config,
                status: m.data.status
            })));
        });
    }
}

export default App;