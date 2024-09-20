const pgp = require("pg-promise")(/* options */)
const auth = require("../auth/secrets").psql
const db = pgp(auth)

module.exports = db
