const express = require("express")
const router = express.Router()
const cellHelper = require("../libs/cell-helper")
const csv = require("../libs/csv")
const fp = require("../libs/fbase-psql")
const mapping = require("../libs/mapping")
const utils = require("../libs/utils")


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
    } else {
      // command must be either general, cellular, wifi, or json
      const data = await fp.psqlFetchJson(params);

      switch (command) {
        case ("general"): {
          let out = csv.general(data);
          if (out === "") {
            res.status(404).send("No data within the selected query !");
          } else {
            res.send(out);
          }
          break;
        }
        case ("cellular"): {
          let out = csv.cellular(data);
          if (out === "") {
            res.status(404).send("No data within the selected query !");
          } else {
            res.send(out);
          }
          break;
        }
        case ("wifi"): {
          let out = csv.wifi(data);
          if (out === "") {
            res.status(404).send("No data within the selected query !");
          } else {
            res.send(out);
          }
          break;
        }
        case ("json"): {
          if (data.length === 0) {
            res.status(404).send("No data within the selected query !");
          } else {
            res.json(data);
          }
          break;
        }
        case ("metaMap"): {
          if (data.length === 0) {
            res.status(404).send("No data within the selected query !");
          } else {
            let boundary = mapping.getBoundary(data);
            res.json({
              boundary: boundary,
              bandList: cellHelper.getBandList(data, cellHelper.REGION.NAR),
              opList: utils.getOpList(data)
            });
          }
          break;
        }
        case ("cellularMap"): {
          if (data.length === 0) {
            res.status(404).send("No data within the selected query !");
          } else {
            let geojson = mapping.cellular(data, params);
            res.json(geojson);
          }
          break;
        }
        default:
          res.status(500).json(`Unknown command "${command}" !`)
      }
    }
  })

module.exports = router;
