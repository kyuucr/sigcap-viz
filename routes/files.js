const express = require("express");
const router = express.Router();
const path = require("path");

const cellHelper = require("../libs/cell-helper");
const csv = require("../libs/csv")
const fp = require("../libs/fbase-psql")
const mapping = require("../libs/mapping")
const utils = require("../libs/utils")
const { parallelProcess } = require("../libs/parallel");


let isUpdating = false;


/* GET users listing. */
router.route("/")
  .get(async (req, res, next) => {
    res.json(await fp.psqlFetchFiles())
  })
  .post(async (req, res, next) => {
    console.log("request= ", req.body)
    let command = req.body.command
    let params = req.body.params

    if (command === "filter") {
      res.json(await fp.psqlFetchFiles(params));

    } else if (command === "general") {
      const data = await fp.psqlFetchJson(params);
      let out = csv.general(data);
      if (out === "") {
        res.status(404).send("No data within the selected query !");
      } else {
        res.send(out);
      }

    } else if (command === "cellular") {
      const data = await fp.psqlFetchJson(params);
      console.log(`# of data= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let cellularJson = csv.cellularJson(data);
        console.log(`# cellular entries= ${cellularJson.length}`);
        res.send(csv.toCsv(cellularJson));
      }

    } else if (command === "cellularParallel") {
      const data = await fp.psqlFetchJson(params);
      console.log(`# of data= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let cellularJson = await parallelProcess(data, "cellular", 16);
        console.log(`# cellular entries= ${cellularJson.length}`);
        res.send(csv.toCsv(cellularJson));
      }

    } else if (command === "cellularPsql") {
      const data = await Promise.allSettled([
        fp.psqlFetchCellInfoJson(params, csv.psqlToCellJson),
        fp.psqlFetchNrInfoJson(params, csv.psqlToNrJson)
      ])
      .then(results => {
        return results.filter(val => val.status === "fulfilled")
          .map(val => val.value)
          .flat()
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      });
      console.log(`# of cellular entries= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        res.send(csv.toCsv(data));
      }

    } else if (command === "wifi") {
      const data = await fp.psqlFetchJson(params);
      console.log(`# of data= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let wifiJson = csv.wifiJson(data);
        console.log(`# Wi-Fi entries= ${wifiJson.length}`);
        res.send(csv.toCsv(wifiJson));
      }

    } else if (command === "wifiParallel") {
      const data = await fp.psqlFetchJson(params);
      console.log(`# of data= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let wifiJson = await parallelProcess(data, "wifi", 16);
        console.log(`# Wi-Fi entries= ${wifiJson.length}`);
        res.send(csv.toCsv(wifiJson));
      }

    } else if (command === "wifiPsql") {
      const data = await fp.psqlFetchWifiInfoJson(params, csv.psqlToWifiJson);
      console.log(`# of Wi-Fi entries= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        res.send(csv.toCsv(data));
      }

    } else if (command === "json") {
      const data = await fp.psqlFetchJson(params);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        res.json(data);
      }

    } else if (command === "metaMap") {
      const data = (await fp.psqlFetchJson(params))
        .filter(val => val.location.latitude !== 0 && val.location.longitude !== 0);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        const boundary = mapping.getBoundary(data);
        const opList = utils.getOpList(data);
        const bandList = Object.assign(
          {},
          ...opList.map(op => {
            const temp = data.filter(val => utils.getCleanOp(val) === op);
            return {
              [op]: cellHelper.getBandList(temp, cellHelper.REGION.NAR)
            };
          })
        );
        res.json({
          boundary: boundary,
          bandList: bandList,
          opList: opList
        });
      }

    } else if (command === "cellularMap") {
      const data = (await fp.psqlFetchJson(params))
        .filter(val => val.latitude !== 0 && val.longitude !== 0);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let cellularJson = csv.cellularJson(data, params.techFilter);
        console.log(`# cellular entries= ${cellularJson.length}`);
        res.json(mapping.cellular(cellularJson, params));
      }

    } else if (command === "cellularMapPsql") {
      let data;
      if (params.techFilter === "lte") {
        data = await fp.psqlFetchCellInfoJson(params, csv.psqlToCellJsonRedux);
      } else if (params.techFilter === "nr") {
        data = await fp.psqlFetchNrInfoJson(params, csv.psqlToNrJsonRedux);
      } else {
        res.status(404).send("Must specify techFilter !");
        return;
      }
      data = data.filter(val => val.latitude !== 0 && val.longitude !== 0);
      console.log(`# of cellular entries= ${data.length}`);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let geojson = mapping.cellular(data, params);
        res.json(geojson);
      }

    } else if (command === "wifiMap") {
      const data = (await fp.psqlFetchJson(params))
        .filter(val => val.latitude !== 0 && val.longitude !== 0);
      if (data.length === 0) {
        res.status(404).send("No data within the selected query !");
      } else {
        let wifiJson = csv.wifiJson(data);
        console.log(`# Wi-Fi entries= ${wifiJson.length}`);
        res.json(mapping.wifi(wifiJson, params));
      }

    } else if (command === "update") {
      if (isUpdating) {
        console.log("Still in update process !");
        res.status(500).send("Still in update process !");
      } else {
        isUpdating = true;

        // Fetch postgresql and firebase files and compare
        const fbaseFiles = await fp.fbaseListFilesExternal(false);
        // console.log(fbaseFiles.map(val => val.name).join("\n"));
        console.log(`# of zipfiles= ${fbaseFiles.length}`);

        let totalFail = 0;
        if (fbaseFiles.length > 0) {
          const response = await fp.fbaseDownload(fbaseFiles);
          totalFail = await fp.processZipFiles(response, fbaseFiles.map(val => val.name))
        }

        isUpdating = false;
        res.status(200).send(`Update finished ! # new files= ${fbaseFiles.length - totalFail}`);
      }

    } else {
      res.status(500).json(`Unknown command "${command}" !`);

    }
  })

module.exports = router;
