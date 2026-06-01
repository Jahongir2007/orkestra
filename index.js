/*
    Orkestra framework v0.0.1
    Author: Jahongir Sobirvo
    License: MIT
    (c) 2026 All right reserved
*/
import { WorkerManager } from "./workers/worker.js";
import { parentPort } from "worker_threads";

export default class Orkestra{
    constructor(){
        this.workerManager = new WorkerManager();
        this.pending = new Map();
        this.taskCounter = 0;
        this.pool = null;
    
        // this.workerManager.setPendingMap(this.pending);
    }

    worker(name, filename, size){
        this.workerManager.setPendingMap(this.pending);

        const pool = this.workerManager.register(
            name,
            filename,
            size
        );

        this.pool = pool;
        // return this.workerManager.register(
        //     name,
        //     filename,
        //     size
        // );

        this.pool.on("message", (message) => {
            const pending =
                this.pending.get(message.id);

            if (!pending) return;

            if (message.success) {
                pending.resolve(message.result);
            } else {
                pending.reject(
                    new Error(message.error)
                );
            }

            this.pending.delete(message.id);
        });

        return this.pool;
    }

    dispatch(workerName, task) {
        const worker = this.workerManager.getNextWorker(workerName);

        if (!worker) {
            throw new Error(
                `Worker "${workerName}" not found`
            );
        }

        const id = this.generateTaskId();
        task.id = id;

        // worker.postMessage(payload);
        // for(const worker of workers){
        //     worker.postMessage(payload)
        // }
        // worker.postMessage(payload);
    
        return new Promise((resolve, reject) => {
            this.pending.set(id, {resolve, reject})

            worker.postMessage(task);
        })
    }

    generateTaskId() {
        return `${Date.now()}-${++this.taskCounter}`;
    }
}

export function defineWorker(handlers) {
    parentPort.on("message", async (task) => {
        const handler = handlers[task.action];

        if (!handler) {
            parentPort.postMessage({
                error: `Unknown action ${task.action}`
            });

            return;
        }

        try {
            const result = await handler(task.payload);

            parentPort.postMessage({
                id: task.id,
                success: true,
                result
            });
        } catch (err) {
            parentPort.postMessage({
                id: task.id,
                success: false,
                error: err.message
            });
        }
    });
}