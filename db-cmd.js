const fs = require("fs");
const path = require("path"); 
const { parseArgs } = require("util");
const fp = require("./libs/fbase-psql");
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

  try {

    let tables = await fp.psqlFetchTableNames();
    console.log(`Got tables= ${tables.join(", ")}`);
    
    if (tables.length > 0) {
      if (force) {
        console.log(`Force DB reinit ...`);
        await fp.psqlDropTables(tables);
      } else {
        throw new Error(`DB already initialized, rerun with --force to continue !`);
      }
    }

    await fp.psqlInitTables()
    console.log(`DB initialized !`)

  } catch (error) {
    console.error(error);
  }
}

async function importZip(inputPath) {
  console.log(`Importing zip path ${inputPath} ...`);

  let totalCount = 0;
  let totalFailure = 0;
  try {
    let zipFilesFound;
    if (fs.statSync(inputPath).isFile()) {
      zipFilesFound = [ inputPath ];
    } else {
      zipFilesFound = await utils.rglob(inputPath, /\.zip$/);
    }
    totalCount = zipFilesFound.length;
    console.log(`# of zipfiles= ${zipFilesFound.length}`);

    let fileIdx = 1;
    for (const zipFilePath of zipFilesFound) {
      const fn = path.basename(zipFilePath, ".zip");
      console.log(`(${fileIdx}/${totalCount}) Reading ${fn} ...`);
      const promises = [];

      const extracted = await utils.readZip(zipFilePath);
      if (extracted.length === 0) {
        totalFailure += 1;
      } else {
        console.log(`# of zip entries= ${extracted.length}`);
        await fp.psqlInsertData(fn, extracted);
      }
      fileIdx += 1;
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.log(`Import done ! Failure rate = ${(totalFailure / totalCount).toFixed(2)}%`)
  }
}
