const express = require("express")
const router = express.Router()
const db = require("../libs/db")
const csv = require("../libs/csv")

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
    let files
    switch (command) {
      case ("filter"):
        db.any(`SELECT DISTINCT fn FROM data WHERE fn LIKE '%${params}%' ORDER BY fn DESC;`)
          .then(data => res.json(data.map(val => val.fn)))
        break;
      case ("general"):
        files = JSON.stringify(params).replaceAll("\"", "'")
        // console.log(files)
        db.any(`SELECT fn, properties FROM data WHERE fn = ANY(ARRAY${files});`)
          .then(data => {
            let out = csv.general(data.map(val => val.properties))
            res.send(out)
          })
        break;
      case ("cellular"):
        files = JSON.stringify(params).replaceAll("\"", "'")
        // console.log(files)
        db.any(`SELECT fn, properties FROM data WHERE fn = ANY(ARRAY${files});`)
          .then(data => {
            let out = csv.cellular(data.map(val => val.properties))
            res.send(out)
          })
        break;
      case ("wifi"):
        files = JSON.stringify(params).replaceAll("\"", "'")
        // console.log(files)
        db.any(`SELECT fn, properties FROM data WHERE fn = ANY(ARRAY${files});`)
          .then(data => {
            let out = csv.wifi(data.map(val => val.properties))
            res.send(out)
          })
        break;
      case ("json"):
        files = JSON.stringify(params).replaceAll("\"", "'")
        // console.log(files)
        db.any(`SELECT fn, properties FROM data WHERE fn = ANY(ARRAY${files});`)
          .then(data => {
            res.send(data.map(val => val.properties))
          })
        break;
      default:
        res.json({"error": `Unknown command "${command}" !`})
    }
  })

module.exports = router;
