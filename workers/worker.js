import { EventEmitter } from "events";
import { Worker } from "node:worker_threads";

export class WorkerManager {
    constructor(){
        this.worker = new Map();
        this.pending = null;
        this.current = new Map();
    }

    setPendingMap(pendingMap) {
        this.pending = pendingMap;
    }

    register(name, file, size = 1){
        if (this.worker.has(name)) {
            throw new Error(
                `Worker "${name}" already exists`
            );
        }

        const pool = []
        for(let i = 0; i < size; i++){
            const w = new Worker(file)
            pool.push(w)
        }

        // const worker = new Worker(file);

        this.worker.set(name, pool);
        this.current.set(name, 0);

        return new WorkerPool(pool);
    }

    get(name){
        return this.worker.get(name);
    }

    getNextWorker(name){
        const pool = this.worker.get(name);

        if(!pool){
            return null;
        }

        let index = this.current.get(name);

        const worker = pool[index];

        index = (index + 1) % pool.length;

        this.current.set(name, index);

        return worker;
    }
}

class WorkerPool extends EventEmitter {
    constructor(workers){
        super();

        this.workers = workers;

        for (const worker of workers){
            worker.on("message", (msg) => {
                this.emit("message", msg);
            });

            worker.on("error", (err) => {
                this.emit("error", err);
            });

            worker.on("exit", (code) => {
                this.emit("exit", code);
            });
        }
    }
}