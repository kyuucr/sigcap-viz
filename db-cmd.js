const AdmZip = require('adm-zip');
const fs = require("fs");
const path = require("path"); 
const { parseArgs } = require("util");
const db = require("./libs/db");
const utils = require("./libs/utils");

const options = {
  "force": {
    type: "boolean",
  }
}

const { values, positionals } = parseArgs({ options, allowPositionals: true });
// console.log(values)

if (positionals.length < 1) {
  console.log("Need to specify a command ! { init, import, update }");
  process.exit(1);
}

switch (positionals[0]) {
  case "init":
    (async () => {
      initDb();
    })();
    break;
  case "import":
    if (positionals.length < 2) {
      console.log("Need to specify a zipfile or folder !");
      process.exit(1);
    }
    (async () => {
      importZip(positionals[1]);
    })();
    break;
  case "update":
    break;
  default:
    console.log(`Unknown command "${positionals[0]}" !`);
}

async function initDb() {
  console.log("Begin initializing database ...");
  const force = values.force;

  let sco; // shared connection object
  try {
    const obj = await db.connect();
    sco = obj;

    let tables = (await sco.any(`SELECT table_name `
        + `FROM information_schema.tables WHERE table_schema = 'public';`))
      .map(val => val.table_name);
    console.log(`Got tables= ${tables.join(", ")}`);
    
    if (tables.length > 0) {
      if (values.force) {
        console.log(`Force DB reinit ...`)
        for (let table of tables) {
          console.log(`Dropping table= ${table} ...`)
          await sco.none(`DROP TABLE IF EXISTS ${table} CASCADE;`)
        }
      } else {
        throw new Error(`DB already initialized, rerun with --force to continue !`)
      }
    }

    await sco.none(`CREATE TABLE data(
      id SERIAL PRIMARY KEY,
      fn VARCHAR(255) NOT NULL,
      uuid_dt VARCHAR(255) UNIQUE NOT NULL,
      data_timestamp timestamp with time zone,
      properties JSONB
    );`);
    console.log(`DB initialized !`)

  } catch (error) {
    console.error(error);
  } finally {
    // release the connection
    // console.log(`releasing connection..`)
    if (sco) {
      sco.done();
    }
    // console.log(`connection released !`)
  }
}

async function importZip(inputPath) {
  console.log(`Importing zip path ${inputPath} ...`);

  let totalCount = 0;
  let totalFailure = 0;
  let sco; // shared connection object
  try {
    const obj = await db.connect();
    sco = obj;

    let zipFilesFound;
    if (fs.statSync(inputPath).isFile()) {
      zipFilesFound = [ inputPath ];
    } else {
      zipFilesFound = await utils.rglob(inputPath, /\.zip$/);
    }
    console.log(`# of zipfiles= ${zipFilesFound.length}`);
    // console.log(zipFilesFound);

    for (const zipFilePath of zipFilesFound) {
      const promises = [];
      const zip = new AdmZip(zipFilePath);
      const zipEntries = zip.getEntries();
      const fn = path.basename(zipFilePath, ".zip");
      console.log(`Reading ${fn} ... # of zip entries= ${zipEntries.length}`);

      for (const zipEntry of zipEntries) {
        // Process only files, not directories
        if (!zipEntry.isDirectory) {
          // Extract file content as JSON
          const fileContent = zip.readAsText(zipEntry);
          const inputJson = JSON.parse(fileContent);
          // console.log(inputJson);

          // Extract additional attributes
          const uuid_dt = `${inputJson.uuid ? inputJson.uuid : "0"}-`
            + `${path.basename(zipEntry.entryName, ".txt")}`;
          const timestamp = utils.getCleanDatetime(inputJson);
          // console.log(fn, uuid_dt, timestamp)

          promises.push(
            sco.none(
              "INSERT INTO data(fn, uuid_dt, data_timestamp, properties) "
                + "VALUES ($1, $2, $3, $4) ON CONFLICT (uuid_dt) DO NOTHING;",
              [fn, uuid_dt, timestamp, JSON.stringify(inputJson)]));
        }
      }

      // Wait until all zip entries are processed
      const results = await Promise.allSettled(promises)
      const failureCount = results.filter(val => val.status === "rejected").length;
      console.log(`Results failure rate= ${failureCount / zipEntries.length}`);

      totalCount += zipEntries.length;
      totalFailure += failureCount;
    }
  } catch (error) {
    console.error(error);
  } finally {
    // release the connection
    if (sco) {
      sco.done();
    }
    console.log(`Import done ! Total failure rate = ${totalFailure / totalCount}`)
  }
}
