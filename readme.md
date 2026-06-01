# 🚀 Orkestra

**Orkestra** is a lightweight worker-thread orchestration framework for Node.js that enables parallel task execution using worker pools, round-robin scheduling, and async task dispatching.

It is designed to simplify CPU-heavy workloads and bring structured job execution to Node.js applications.

## ✨ Features
 - ⚡ Worker Threads abstraction
 - 🔁 Round-robin load balancing
 - 🧵 Worker pools support
 - ⏳ Async task dispatch (Promise-based)
 - 📡 Event-based communication
 - 🧠 Simple API inspired by Node.js patterns

## 📦 Installation
```bash
npm install orkestra
```

## 🚀 Quick Start
### 1. Create a worker
```js
// calc.js
import { defineWorker } from "orkestra";

defineWorker({
    sum({ a, b }) {
        return a + b;
    },

    multiply({ a, b }) {
        return a * b;
    }
});
```

### 2. Use Orkestra in main thread
```js
import Orkestra from "orkestra";

const app = new Orkestra();

// create worker pool
app.worker("calculator", "./calc.js", 2);

// dispatch tasks
const result = await app.dispatch("calculator", {
    action: "sum",
    payload: { a: 10, b: 20 }
});

console.log(result); // 30
```

## 🧵 Worker Pool Example
```js
app.worker("calculator", "./calc.js", 4);
```
This creates 4 worker threads and distributes tasks using round-robin scheduling.

## ⚙️ How It Works
```
Main Thread
    ↓
dispatch(task)
    ↓
Worker Pool (round-robin)
    ↓
Worker Thread executes task
    ↓
Result returned via message channel
    ↓
Promise resolved in main thread
```

## 📡 API
### `app.worker(name, file, size)`
Creates a worker pool.

| Param | Type   | Description       |
| ----- | ------ | ----------------- |
| name  | string | Worker pool name  |
| file  | string | Worker file path  |
| size  | number | Number of workers |


### `app.dispatch(name, task)`
Dispatches a task to a worker pool.
Returns a Promise.
```js
const result = await app.dispatch("calculator", {
    action: "sum",
    payload: { a: 1, b: 2 }
});
```

### `defineWorker(handlers)`
Defines worker logic.

```js
defineWorker({
    sum({ a, b }) {
        return a + b;
    }
});
```

### 🧠 Use Cases
 - CPU-heavy computations
 - Image / video processing
 - Data transformation pipelines
 - Background job execution
 - Parallel API workloads
 - Batch processing systems

### ⚠️ Important Notes
 - Workers run in separate threads
 - Communication happens via message passing
 - Each task is isolated and async
 - Not recommended for small lightweight tasks