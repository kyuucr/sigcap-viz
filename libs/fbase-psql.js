// Interface between firebase storage and postgresql
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const db = require("./db");
const utils = require("./utils");

const { TransferManager } = require('@google-cloud/storage');
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const serviceAccount = require("../auth/laa-cell-map-a3e01842e98c.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "laa-cell-map.appspot.com"
});


const createFilter = function(params) {
  let filterStr = []
  if (params.files) {
    filterStr.push(`fn = ANY(ARRAY${JSON.stringify(params.files).replaceAll("\"", "'")})`)
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
  if (params.timestamp && params.timestamp.start && params.timestamp.end) {
    filterStr.push(`data_timestamp >= '${params.timestamp.start}'::timestamp`)
    filterStr.push(`data_timestamp < '${params.timestamp.end}'::timestamp`)
  }

  let outStr = filterStr.join(" AND ")
  console.log(`filterStr= ${outStr}`)

  return outStr
}


const fp = {

  psqlLastTimestamp: async function () {
    return await db.one(
      `SELECT data_timestamp FROM data ORDER BY data_timestamp DESC LIMIT 1;`,
      [],
      c => new Date(c.data_timestamp));
  },

  psqlFetchFiles: async function (filter) {
    let filterStr = "";
    if (filter) {
      filterStr = `WHERE fn LIKE '%${filter}%' `;
    }
    return (await db.any(`SELECT DISTINCT fn FROM data ${filterStr}ORDER BY fn DESC;`))
      .map(val => val.fn);
  },

  psqlFetchJson: async function (params) {
    return (await db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`))
      .map(val => val.properties);
  },

  psqlFetchTableNames: async function () {
    return (await db.any(`SELECT table_name `
        + `FROM information_schema.tables WHERE table_schema = 'public';`))
      .map(val => val.table_name);
  },

  psqlDropTables: async function (tables) {
    if (tables === undefined || !tables.length) {
      throw Error(`Must specify tables !`);
    }

    let sco; // shared connection object
    try {
      const obj = await db.connect();
      sco = obj;

      for (let table of tables) {
        console.log(`Dropping table= ${table} ...`)
        await sco.none(`DROP TABLE IF EXISTS ${table} CASCADE;`)
      }
    } catch (error) {
      console.error(`Error dropping tables !`)
      console.error(error);
      return "rejected";
    } finally {
      // release the connection
      if (sco) {
        sco.done();
      }
      return "fulfilled";
    }
  },

  psqlInitTables: async function () {
    // Use db for now since we only have one table
    return db.none(`CREATE TABLE data(
      id SERIAL PRIMARY KEY,
      fn VARCHAR(255) NOT NULL,
      uuid_dt VARCHAR(255) UNIQUE NOT NULL,
      data_timestamp timestamp with time zone,
      properties JSONB
    );`);
  },

  psqlInsertData: async function(fn, zipArr) {
    // Create input array
    // zipArr is an array of { name, textContent } from util.readZip
    const inputs = zipArr.map(entry => {
      try {
        // Parse text to JSON
        const parsed = JSON.parse(entry.textContent);

        // Extract additional attributes
        const uuid_dt = `${parsed.uuid ? parsed.uuid : "0"}-`
          + `${path.basename(entry.name, ".txt")}`;
        const timestamp = utils.getCleanDatetime(parsed);

        return [fn, uuid_dt, timestamp, entry.textContent];
      } catch (err) {
        console.error(`Error reading ${entry.name}`);
        console.error(err);
        return [];
      }
    }).filter(val => val.length === 4);

    // Run insert queries
    let sco; // shared connection object
    try {
      const obj = await db.connect();
      sco = obj;

      await Promise.allSettled(
        inputs.map(val => {
          return sco.none(
            "INSERT INTO data(fn, uuid_dt, data_timestamp, properties) "
                + "VALUES ($1, $2, $3, $4) ON CONFLICT (uuid_dt) DO NOTHING;",
              val)
        })
      );

    } catch (error) {
      console.error(error);
    } finally {
      // release the connection
      if (sco) {
        sco.done();
      }
    }
  },

  fbaseListFiles: async function (filterStr) {
    if (filterStr && !filterStr.endsWith("/")) {
      filterStr += "/";
    }
    const bucket = getStorage().bucket();
    const [ data ] = (await bucket.getFiles({
      matchGlob: `dataset/${filterStr}*.zip`
    }));
    return data;
  },

  fbaseDownload: async function (files) {
    const transferManager = new TransferManager(getStorage().bucket());
    const response = (await transferManager.downloadManyFiles(files))
      .map(val => val[0]);
    return response;
  }

}

module.exports = fp
