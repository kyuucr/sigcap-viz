const pgp = require("pg-promise")(/* options */)
const { psql } = require("../auth/secrets")
const db = pgp(psql)

module.exports = db
