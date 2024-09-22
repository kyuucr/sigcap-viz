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
  let totalCount = zipFilesFound.length;
  let totalFailure = 0;
  console.log(`# of zipfiles= ${zipFilesFound.length}`);

  let fileIdx = 1;
  for (const zipFilePath of zipFilesFound) {
    const fn = path.basename(zipFilePath, ".zip");
    console.log(`(${fileIdx}/${totalCount}) Reading ${fn} ...`);

    const extracted = await utils.readZip(zipFilePath);
    if (extracted.length === 0) {
      totalFailure += 1;
    } else {
      console.log(`# of zip entries= ${extracted.length}`);
      await fp.psqlInsertData(fn, extracted);
    }
    fileIdx += 1;
  }
  console.log(`Import done ! Failure rate = ${(totalFailure / totalCount).toFixed(2)}%`)
}

async function updateFbase () {
  // Fetch postgresql and firebase files and compare
  const psqlFiles = await fp.psqlFetchFiles();
  let fbaseFiles = [];
  if (values["no-filter"]) {
    console.log(`WARNING: fetching all files without filter !`)
    fbaseFiles = fbaseFiles.concat((await fp.fbaseListFiles())
      .filter(val => {
        return !psqlFiles.includes(path.basename(val.name, ".zip"));
      })
    );
  } else {
    // Get last timestamp to filter firebase query
    const lastTimestamp = await fp.psqlLastTimestamp();
    console.log(`Last timestamp= ${lastTimestamp}`);

    // Use last and this month only
    const fbaseFiltersBase = lastTimestamp.getFullYear() + "/"
    const fbaseFilters = [
      fbaseFiltersBase + (lastTimestamp.getMonth()).toString().padStart(2, "0"),
      fbaseFiltersBase + (lastTimestamp.getMonth() + 1).toString().padStart(2, "0")
    ];
    console.log(`Using filters= ${fbaseFilters.join(", ")}`);

    for (let filter of fbaseFilters) {
      fbaseFiles = fbaseFiles.concat((await fp.fbaseListFiles(filter))
        .filter(val => {
          return !psqlFiles.includes(path.basename(val.name, ".zip"))
        })
      );
    }
  }
  // console.log(fbaseFiles.map(val => val.name).join("\n"));
  console.log(`# of zipfiles= ${fbaseFiles.length}`);

  let totalCount = fbaseFiles.length;
  let totalFailure = 0;
  if (fbaseFiles.length > 0) {
    const response = await fp.fbaseDownload(fbaseFiles);
    let fileIdx = 1
    for (let zipFileBuffer of response) {
      const fn = path.basename(fbaseFiles[fileIdx - 1].name, ".zip");
      console.log(`(${fileIdx}/${totalCount}) Reading ${fn} ...`);

      const extracted = await utils.readZip(zipFileBuffer);
      if (extracted.length === 0) {
        totalFailure += 1;
      } else {
        console.log(`# of zip entries= ${extracted.length}`);
        await fp.psqlInsertData(fn, extracted);
      }
      fileIdx += 1;
    }
  }

  console.log(`Import done ! Total zip read failure rate = ${(totalFailure / totalCount).toFixed(2)}%`)
}
