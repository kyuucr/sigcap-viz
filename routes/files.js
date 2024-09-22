const express = require("express")
const router = express.Router()
const csv = require("../libs/csv")
const fp = require("../libs/fbase-psql")


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
          let out = csv.general(data)
          if (out === "") {
            res.status(404).send("No data within the selected query !")
          } else {
            res.send(out)
          }
          break;
        }
        case ("cellular"): {
          let out = csv.cellular(data)
          if (out === "") {
            res.status(404).send("No data within the selected query !")
          } else {
            res.send(out)
          }
          break;
        }
        case ("wifi"): {
          let out = csv.wifi(data)
          if (out === "") {
            res.status(404).send("No data within the selected query !")
          } else {
            res.send(out)
          }
          break;
        }
        case ("json"): {
          if (data.length === 0) {
            res.status(404).send("No data within the selected query !")
          } else {
            res.json(data)
          }
          break;
        }
        default:
          res.status(500).json(`Unknown command "${command}" !`)
      }
    }
  })

module.exports = router;
