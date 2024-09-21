const fs = require('fs');
const path = require('path');

const usualCarriers = [
  "AT&T",
  "Sprint",
  "T-Mobile",
  "Verizon",
]

const utils = {
  sortNumDsc: (a, b) => b - a,
  sortNumAsc: (a, b) => a - b,

  mwToDbm: function(input) {
    if (input.map !== undefined) {
      return input.map(val => 10 * Math.log10(val))
    } else if (typeof input === "number")  {
      return 10 * Math.log10(input)
    } else {
      throw Exception(`Input ${input} is not a number!`)
    }
  },

  dbmToMw: function(input) {
    if (input.map !== undefined) {
      return input.map(val => Math.pow(10, val / 10))
    } else if (typeof input === "number")  {
      return Math.pow(10, input / 10)
    } else {
      throw Exception(`Input ${input} is not a number!`)
    }
  },

  isValidOp: function(opString) {
    return opString !== undefined
      && opString !== ""
      && opString !== "Searching for Service"
      && opString !== "Extended Network"
      && opString !== "Extended"
      && opString !== "Preferred System"
  },

  getCleanOp: function(data) {
    let op = [data.opName, data.simName, data.carrierName, "unknown"].reduce(
      (prev, curr) => this.isValidOp(prev) ? prev : curr).trim()

    for (let usualCarrier of usualCarriers){
      if (op !== usualCarrier && op.startsWith(usualCarrier)) {
        op = usualCarrier
      }
    }
    return op
  },

  getActiveNetwork: function(data) {
    // We don't trust network type from the API
    let hasNr = data.nr_info && (data.nr_info.length > 0)
    let hasPrimaryNr = data.nr_info && data.nr_info.some(val => val.status === "primary")
    let hasLte = data.cell_info && (data.cell_info.length > 0)

    let networkType
    if (data.networkType === "IWLAN") {
      networkType = "Wi-Fi"
    } else if (data.networkType === "LTE"
        && data.dcNrRestricted === false
        && data.nrAvailable === true
        && data.enDcAvailable === true
        && data.nrStatus === "not restricted") {
      networkType = "LTE-DSS"
    } else if (hasNr && hasPrimaryNr && !hasLte) {
      networkType = "NR"
    } else if (hasNr && hasLte) {
      networkType = "NR-NSA"
    } else if (hasLte) {
      networkType = "LTE"
    } else if (data.networkType) {
      networkType = data.networkType
    } else {
      networkType = "unknown"
    }
    return networkType
  },

  getDate: function(str) {
    return `${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)}`;
  },

  getTime: function(str, printMs = false) {
    return `${str.substring(0,2)}:${str.substring(2,4)}:${str.substring(4,6)}${printMs ? "." + str.substring(6,9) : ""}`;
  },

  getCleanDatetime: function(input) {
    let datetimeIso
    if (typeof input === "object") {
      // This should be SigCap object
      datetimeIso = input.datetimeIso
      if (datetimeIso === undefined) {
        // datetimeIso is not available, fallback to datetime object
        datetimeIso = `${this.getDate(input.datetime.date)}T${this.getTime(input.datetime.time, true)}${input.datetime.zone}`
      }
    } else if (typeof input === "string" && input.length === 24) {
      // This should be filename, ex: 20240908T155149636Z-0500
      datetimeIso = `${this.getDate(input.substring(0,8))}T${this.getTime(input.substring(9,18), true)}${input.substring(19,24)}`
    } else {
      throw new Exception("Cannot get a clean datetime: ", input)
    }
    return datetimeIso
  },

  printDateTime: function(input) {
    let dateObj = (typeof input === "object") ? input : new Date(input)
    let offset = dateObj.getTimezoneOffset();
    dateObj = new Date(dateObj.getTime() - (offset * 60 * 1000));
    return dateObj.toISOString().replace(`Z`, `${offset > 0 ? "-" : "+"}${('00' + Math.abs(offset / 60)).slice(-2)}${('00' + Math.abs(offset % 60)).slice(-2)}`);
  },

  cleanSignal: function(signal) {
    signal = this.cleanNumeric(signal);
    return (signal === 2147483647 || signal === 9223372036854775807) ? NaN : signal;
  },

  cleanNumeric: function(number) {
    if (number === undefined) return NaN;
    if (typeof number !== 'number') {
      try {
        if (number.includes(".")) {
          number = parseFloat(number);
        } else {
          number = parseInt(number);
        }
      } catch (err) {
        return NaN;
      }
    }
    return number;
  },

  cleanString: function(string) {
    return (string === undefined) ? "N/A" : string;
  },

  rglob: async function(directoryPath, pattern = '*') {
    let matchingFiles = [];

    const entries = await fs.promises.readdir(directoryPath);

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry);
      const stats = await fs.promises.stat(fullPath);

      if (stats.isFile() && entry.match(pattern)) {
        matchingFiles.push(fullPath);
      } else if (stats.isDirectory()) {
        const subdirectoryMatches = await rglob(fullPath, pattern);
        matchingFiles = matchingFiles.concat(subdirectoryMatches);
      }
    }

    return matchingFiles;
  },
}

module.exports = utils
