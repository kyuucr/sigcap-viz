const { Worker } = require("worker_threads");

function parallelProcess(myArray, mode, numThreads = 4) {
  return new Promise((resolve, reject) => {
    console.log(`Creating threads, num= ${numThreads}, array length= ${myArray.length}`);
    const results = [];
    let completedThreads = 0;

    for (let i = 0; i < numThreads; i++) {
      const currStart = i * Math.floor(myArray.length / numThreads);
      const currEnd = (i + 1) * Math.floor(myArray.length / numThreads);
      console.log(`Creating threads #${i}, currStart= ${currStart}, currEnd= ${currEnd}`);
      const worker = new Worker("./libs/worker.js", {
        workerData: {
          threadId: i,
          mode: mode,
          data: myArray.slice(currStart, currEnd)
        }
      });

      worker.on('message', (result) => {
        results.push(result);
        completedThreads++;

        if (completedThreads === numThreads) {
          resolve(results.flat());
        }
      });

      worker.on('error', reject); 
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    }
  });
}

module.exports = { parallelProcess };