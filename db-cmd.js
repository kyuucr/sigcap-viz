const fs = require("fs");
const path = require("path"); 
const { parseArgs } = require("util");
const fp = require("./libs/fbase-psql");
const utils = require("./libs/utils");

const options = {
  "force": {
    type: "boolean",
  },
  "no-filter": {
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
    (async () => {
      updateFbase();
    })();
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

  let zipFilesFound;
  if (fs.statSync(inputPath).isFile()) {
    zipFilesFound = [ inputPath ];
  } else {
    zipFilesFound = await utils.rglob(inputPath, /\.zip$/);
  }
  console.log(`# of zipfiles= ${zipFilesFound.length}`);

  await fp.processZipFiles(zipFilesFound, zipFilesFound);
  console.log(`Import done !`)
}

async function updateFbase () {
  // Fetch postgresql and firebase files and compare
  const fbaseFiles = await fp.fbaseListFilesExternal(values["no-filter"]);
  // console.log(fbaseFiles.map(val => val.name).join("\n"));
  console.log(`# of zipfiles= ${fbaseFiles.length}`);

  if (fbaseFiles.length > 0) {
    const response = await fp.fbaseDownload(fbaseFiles);
    await fp.processZipFiles(response, fbaseFiles.map(val => val.name))
  }

  console.log(`Import done !`);
}
