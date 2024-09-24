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
  if (params.opFilter) {
    filterStr.push(
      `((properties->>'opName') LIKE '%${params.opFilter}%' OR `
        + `(properties->>'simName') LIKE '%${params.opFilter}%' OR `
        + `(properties->>'carrierName') LIKE '%${params.opFilter}%')`)
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
      filterStr = ` WHERE fn LIKE '%${filter}%'`;
    }
    return (await db.any(
        `SELECT fn, data_timestamp FROM (`
        + `SELECT DISTINCT ON (fn) fn, data_timestamp FROM data${filterStr}`
        + `) AS subquery ORDER BY data_timestamp DESC;`
      ))
      .map(val => val.fn);
  },

  psqlFetchJson: async function (params) {
    return (await db.any(`SELECT properties FROM data WHERE ${createFilter(params)};`))
      .map(val => val.properties);
  },

  psqlFetchCellInfoJson: async function (params, transformer) {
    const cellSql =
`SELECT
  data_timestamp,
  (properties->'version') AS "version",
  (properties->'androidVersion') AS "androidVersion",
  (properties->'isDebug') AS "isDebug",
  (properties->'uuid') AS "uuid",
  (properties->'deviceName') AS "deviceName",
  (properties->'location'->'latitude') AS "latitude",
  (properties->'location'->'longitude') AS "longitude",
  (properties->'location'->'altitude') AS "altitude",
  (properties->'location'->'hor_acc') AS "hor_acc",
  (properties->'location'->'ver_acc') AS "ver_acc",
  (properties->'opName') AS "opName",
  (properties->'simName') AS "simName",
  (properties->'carrierName') AS "carrierName",
  (properties->'networkType') AS "networkType",
  (properties->'overrideNetworkType') AS "overrideNetworkType",
  (properties->'phoneType') AS "phoneType",
  (properties->'nrStatus') AS "nrStatus",
  (properties->'nrAvailable') AS "nrAvailable",
  (properties->'dcNrRestricted') AS "dcNrRestricted",
  (properties->'enDcAvailable') AS "enDcAvailable",
  (properties->'nrFrequencyRange') AS "nrFrequencyRange",
  (properties->'cellBandwidths') AS "cellBandwidths",
  (properties->'usingCA') AS "usingCA",
  (jsonb_array_length(properties->'cell_info') > 0)::boolean AS "hasLte",
  (jsonb_array_length(properties->'nr_info') > 0)::boolean AS "hasNr",
  ((properties->'nr_info'->0->>'status') = 'primary')::boolean AS "hasPrimaryNr",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."timestampMs"
  END AS "timestampMs",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."timestampDeltaMs"
  END AS "timestampDeltaMs",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."pci"
  END AS "pci",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."ci"
  END AS "ci",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."earfcn"
  END AS "earfcn",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."width"
  END AS "width",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."rsrp"
  END AS "rsrp",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."rsrq"
  END AS "rsrq",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."rssi"
  END AS "rssi",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."cqi"
  END AS "cqi",
  CASE
    WHEN jsonb_array_length(properties->'cell_info') = 0 THEN NULL
    ELSE a."registered"
  END AS "registered"
FROM data
LEFT JOIN LATERAL (SELECT
  jsonb_array_elements(properties->'cell_info')->'timestampMs' AS "timestampMs",
  jsonb_array_elements(properties->'cell_info')->'timestampDeltaMs' AS "timestampDeltaMs",
  jsonb_array_elements(properties->'cell_info')->'pci' AS "pci",
  jsonb_array_elements(properties->'cell_info')->'ci' AS "ci",
  jsonb_array_elements(properties->'cell_info')->'earfcn' AS "earfcn",
  jsonb_array_elements(properties->'cell_info')->'width' AS "width",
  jsonb_array_elements(properties->'cell_info')->'rsrp' AS "rsrp",
  jsonb_array_elements(properties->'cell_info')->'rsrq' AS "rsrq",
  jsonb_array_elements(properties->'cell_info')->'rssi' AS "rssi",
  jsonb_array_elements(properties->'cell_info')->'cqi' AS "cqi",
  jsonb_array_elements(properties->'cell_info')->'registered' AS "registered") a ON TRUE
WHERE ${createFilter(params)};`
    return await db.map(cellSql, [], transformer);
  },

  psqlFetchNrInfoJson: async function (params, transformer) {
    const nrSql =
`SELECT
  data_timestamp,
  (properties->'version') AS "version",
  (properties->'androidVersion') AS "androidVersion",
  (properties->'isDebug') AS "isDebug",
  (properties->'uuid') AS "uuid",
  (properties->'deviceName') AS "deviceName",
  (properties->'location'->'latitude') AS "latitude",
  (properties->'location'->'longitude') AS "longitude",
  (properties->'location'->'altitude') AS "altitude",
  (properties->'location'->'hor_acc') AS "hor_acc",
  (properties->'location'->'ver_acc') AS "ver_acc",
  (properties->'opName') AS "opName",
  (properties->'simName') AS "simName",
  (properties->'carrierName') AS "carrierName",
  (properties->'networkType') AS "networkType",
  (properties->'overrideNetworkType') AS "overrideNetworkType",
  (properties->'phoneType') AS "phoneType",
  (properties->'nrStatus') AS "nrStatus",
  (properties->'nrAvailable') AS "nrAvailable",
  (properties->'dcNrRestricted') AS "dcNrRestricted",
  (properties->'enDcAvailable') AS "enDcAvailable",
  (properties->'nrFrequencyRange') AS "nrFrequencyRange",
  (properties->'cellBandwidths') AS "cellBandwidths",
  (properties->'usingCA') AS "usingCA",
  (jsonb_array_length(properties->'cell_info') > 0)::boolean AS "hasLte",
  (jsonb_array_length(properties->'nr_info') > 0)::boolean AS "hasNr",
  ((properties->'nr_info'->0->>'status') = 'primary')::boolean AS "hasPrimaryNr",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."timestampMs"
  END AS "timestampMs",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."timestampDeltaMs"
  END AS "timestampDeltaMs",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."pci"
  END AS "pci",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."nci"
  END AS "nci",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."nrarfcn"
  END AS "nrarfcn",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."band"
  END AS "band",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."ssRsrp"
  END AS "ssRsrp",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."ssRsrq"
  END AS "ssRsrq",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."ssSinr"
  END AS "ssSinr",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."status"
  END AS "status",
  CASE
    WHEN jsonb_array_length(properties->'nr_info') = 0 THEN NULL
    ELSE a."isSignalStrAPI"
  END AS "isSignalStrAPI"
FROM data
LEFT JOIN LATERAL (SELECT
  jsonb_array_elements(properties->'nr_info')->'timestampMs' AS "timestampMs",
  jsonb_array_elements(properties->'nr_info')->'timestampDeltaMs' AS "timestampDeltaMs",
  jsonb_array_elements(properties->'nr_info')->'nrPci' AS "pci",
  jsonb_array_elements(properties->'nr_info')->'nci' AS "nci",
  jsonb_array_elements(properties->'nr_info')->'nrarfcn' AS "nrarfcn",
  jsonb_array_elements(properties->'nr_info')->'band' AS "band",
  jsonb_array_elements(properties->'nr_info')->'ssRsrp' AS "ssRsrp",
  jsonb_array_elements(properties->'nr_info')->'ssRsrq' AS "ssRsrq",
  jsonb_array_elements(properties->'nr_info')->'ssSinr' AS "ssSinr",
  jsonb_array_elements(properties->'nr_info')->'status' AS "status",
  jsonb_array_elements(properties->'nr_info')->'isSignalStrAPI' AS "isSignalStrAPI") a ON TRUE
WHERE ${createFilter(params)};`;
    return await db.map(nrSql, [], transformer);
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
        const sanitized = entry.textContent.replaceAll("\\u0000", "");
        const parsed = JSON.parse(sanitized);

        // Extract additional attributes
        const uuid_dt = `${parsed.uuid ? parsed.uuid : "0"}-`
          + `${path.basename(entry.name, ".txt")}`;
        const timestamp = utils.getCleanDatetime(parsed);

        return [fn, uuid_dt, timestamp, sanitized];
      } catch (err) {
        console.error(`Error reading ${entry.name}`);
        console.error(err);
        return [];
      }
    }).filter(val => val.length === 4);

    // Run INSERT queries
    let sco; // shared connection object
    let numFail = 0;
    try {
      const obj = await db.connect();
      sco = obj;

      let results = await Promise.allSettled(
        inputs.map(async val => {
          return await sco.one(
            "INSERT INTO data(fn, uuid_dt, data_timestamp, properties) "
              + "VALUES ($1, $2, $3, $4) ON CONFLICT (uuid_dt) DO NOTHING "
              + "RETURNING id;",
            val)
        })
      );
      // console.log(results.map(val => [val.status, val.reason ? val.reason.message: "none", val.value]))
      numFail = results.filter(val => val.status === "rejected").length;
      console.log(`INSERT failure rate= ${(numFail / results.length * 100).toFixed(2)}%`)

    } catch (error) {
      console.error(error);
      return zipArr.length;
    } finally {
      // release the connection
      if (sco) {
        sco.done();
      }
      return numFail;
    }
  },

  fbaseListFiles: async function (filterStr = "*/*/") {
    if (!filterStr.endsWith("/")) {
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
