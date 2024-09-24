const { parentPort, workerData } = require("worker_threads");
const csv = require("./csv");

console.log(`Starting threads #${workerData.threadId}, array len= ${workerData.data.length}`);
let result = [];
if (workerData.mode === "cellular") {
  result = csv.cellularJson(workerData.data);
} else if (workerData.mode === "wifi") {
  result = csv.wifiJson(workerData.data);
}
parentPort.postMessage(result);
