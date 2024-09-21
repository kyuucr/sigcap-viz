const express = require("express")
const router = express.Router()
const db = require("../libs/db")
const csv = require("../libs/csv")

const createFilter = function(params) {
  let filterStr = []
  if (params.files) {
    filterStr.push(`fn = ANY(ARRAY${JSON.stringify(params.files).replaceAll("\"", "'")});`)
  }
  if (params.gps) {
    let [ latStart, lngStart ] = params.gps.start.split(/[ ,]+/, 2).map(parseFloat)
    let [ latEnd, lngEnd ] = params.gps.end.split(/[ ,]+/, 2).map(parseFloat)

    // Swap variable to the correct order
    if (latStart > latEnd) {
      let temp = latEnd
      latEnd = latStart
      latStart = temp
    }
    if (lngStart > lngEnd) {
      let temp = lngEnd
      lngEnd = lngStart
      lngStart = temp
    }
    filterStr.push(`(properties->'location'->'latitude')::float >= ${latStart}`)
    filterStr.push(`(properties->'location'->'latitude')::float <= ${latEnd}`)
    filterStr.push(`(properties->'location'->'longitude')::float >= ${lngStart}`)
    filterStr.push(`(properties->'location'->'longitude')::float <= ${lngEnd}`)
  }
  if (params.timestamp) {
    let startTimestamp = params.timestamp.start + params.timestamp.zone
    let endTimestamp = params.timestamp.end + params.timestamp.zone
    filterStr.push(`data_timestamp >= ${startTimestamp}::timestamp`)
    filterStr.push(`data_timestamp < ${endTimestamp}::timestamp`)
  }

  let outStr = filterStr.join(" AND ")
  console.log(`filterStr= ${outStr}`)

  return outStr
}

/* GET users listing. */
router.route("/")
  .get((req, res, next) => {
    db.any("SELECT DISTINCT fn FROM data ORDER BY fn DESC;").then(data => {
      res.json(data.map(val => val.fn))
    })
  })
  .post((req, res, next) => {
    console.log("request= ", req.body)
    let command = req.body.command
    let params = req.body.params
    switch (command) {
      case ("filter"):
        db.any(`SELECT DISTINCT fn FROM data WHERE fn LIKE '%${params}%' ORDER BY fn DESC;`)
          .then(data => res.json(data.map(val => val.fn)))
        break;
      case ("general"):
        db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`)
          .then(data => {
            let out = csv.general(data.map(val => val.properties))
            if (out === "") {
              res.status(404).send("No data within the selected query !")
            } else {
              res.send(out)
            }
          })
        break;
      case ("cellular"):
        db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`)
          .then(data => {
            let out = csv.cellular(data.map(val => val.properties))
            if (out === "") {
              res.status(404).send("No data within the selected query !")
            } else {
              res.send(out)
            }
          })
        break;
      case ("wifi"):
        db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`)
          .then(data => {
            let out = csv.wifi(data.map(val => val.properties))
            if (out === "") {
              res.status(404).send("No data within the selected query !")
            } else {
              res.send(out)
            }
          })
        break;
      case ("json"):
        db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`)
          .then(data => {
            if (data.length === 0) {
              res.status(404).send("No data within the selected query !")
            } else {
              res.json(data.map(val => val.properties))
            }
          })
        break;
      default:
        res.status(500).json(`Unknown command "${command}" !`)
    }
  })

module.exports = router;
