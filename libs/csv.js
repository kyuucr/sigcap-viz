const utils = require("./utils")
const cellHelper = require("./cell-helper")
const wifiHelper = require("./wifi-helper")
const math = require("mathjs")


function extractMean(entry) {
  const lteValid = entry.cell_info.map(val => {
    return {
      freq: cellHelper.earfcnToFreq(val.earfcn),
      rsrp: utils.cleanSignal(val.rsrp),
      rsrq: utils.cleanSignal(val.rsrq),
      rssi: utils.cleanSignal(val.rssi)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  // f1: freq < 1000
  let lteF1 = lteValid.filter(val => val.freq < 1000);
  // f2: 1000 < freq < 10000
  let lteF2 = lteValid.filter(val => val.freq > 1000 && val.freq < 10000);

  const nrValid = entry.nr_info.map(val => {
    return {
      freq: cellHelper.nrarfcnToFreq(val.nrarfcn),
      rsrp: utils.cleanSignal(val.ssRsrp),
      rsrq: utils.cleanSignal(val.ssRsrq),
      sinr: utils.cleanSignal(val.ssSinr)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  let nrF1 = nrValid.filter(val => val.freq < 1000);
  let nrF2 = nrValid.filter(val => val.freq > 1000 && val.freq < 10000);

  const wifiValid = entry.wifi_info.map(val => {
    return {
      primaryFreq: utils.cleanSignal(val.primaryFreq),
      rssi: utils.cleanSignal(val.rssi)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  let wifi2_4 = wifiValid.filter(val => val.primaryFreq < 5000);
  let wifi5 = wifiValid.filter(val => val.primaryFreq > 5000 && val.primaryFreq <= 5925);
  let wifi6 = wifiValid.filter(val => val.primaryFreq > 5925);

  let out = {
    "hor_acc": entry.location.hor_acc,
    "ver_acc": entry.location.ver_acc,
    "num_of_lte_cell": lteValid.length,
    "lte_num_of_f1": lteF1.length,
    "lte_num_of_f2": lteF2.length,
    "num_of_nr_cell": nrValid.length,
    "nr_num_of_f1": nrF1.length,
    "nr_num_of_f2": nrF2.length,
    "num_of_wifi_2_4": wifi2_4.length,
    "num_of_wifi_5": wifi5.length,
    "num_of_wifi_6": wifi6.length,
  };

  /////////
  // LTE //
  /////////

  if (lteF1.length > 0) {
    const lteF1Rssi = lteF1.map(val => val.rssi);
    out["lte_avg_rssi_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rssi)));
    out["lte_max_rssi_f1"] = math.max(lteF1Rssi);
    out["lte_min_rssi_f1"] = math.min(lteF1Rssi);
    out["lte_std_rssi_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rssi)));

    const lteF1Rsrp = lteF1.map(val => val.rsrp);
    out["lte_avg_rsrp_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rsrp)));
    out["lte_max_rsrp_f1"] = math.max(lteF1Rsrp);
    out["lte_min_rsrp_f1"] = math.min(lteF1Rsrp);
    out["lte_std_rsrp_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rsrp)));

    const lteF1Rsrq = lteF1.map(val => val.rsrq);
    out["lte_avg_rsrq_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rsrq)));
    out["lte_max_rsrq_f1"] = math.max(lteF1Rsrq);
    out["lte_min_rsrq_f1"] = math.min(lteF1Rsrq);
    out["lte_std_rsrq_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rsrq)));
  } else {
    out["lte_avg_rssi_f1"] = "NaN";
    out["lte_max_rssi_f1"] = "NaN";
    out["lte_min_rssi_f1"] = "NaN";
    out["lte_std_rssi_f1"] = "NaN";
    out["lte_avg_rsrp_f1"] = "NaN";
    out["lte_max_rsrp_f1"] = "NaN";
    out["lte_min_rsrp_f1"] = "NaN";
    out["lte_std_rsrp_f1"] = "NaN";
    out["lte_avg_rsrq_f1"] = "NaN";
    out["lte_max_rsrq_f1"] = "NaN";
    out["lte_min_rsrq_f1"] = "NaN";
    out["lte_std_rsrq_f1"] = "NaN";
  }

  if (lteF2.length > 0) {
    const lteF2Rssi = lteF2.map(val => val.rssi);
    out["lte_avg_rssi_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rssi)));
    out["lte_max_rssi_f2"] = math.max(lteF2Rssi);
    out["lte_min_rssi_f2"] = math.min(lteF2Rssi);
    out["lte_std_rssi_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rssi)));

    const lteF2Rsrp = lteF2.map(val => val.rsrp);
    out["lte_avg_rsrp_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rsrp)));
    out["lte_max_rsrp_f2"] = math.max(lteF2Rsrp);
    out["lte_min_rsrp_f2"] = math.min(lteF2Rsrp);
    out["lte_std_rsrp_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rsrp)));

    const lteF2Rsrq = lteF2.map(val => val.rsrq);
    out["lte_avg_rsrq_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rsrq)));
    out["lte_max_rsrq_f2"] = math.max(lteF2Rsrq);
    out["lte_min_rsrq_f2"] = math.min(lteF2Rsrq);
    out["lte_std_rsrq_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rsrq)));
  } else {
    out["lte_avg_rssi_f2"] = "NaN";
    out["lte_max_rssi_f2"] = "NaN";
    out["lte_min_rssi_f2"] = "NaN";
    out["lte_std_rssi_f2"] = "NaN";
    out["lte_avg_rsrp_f2"] = "NaN";
    out["lte_max_rsrp_f2"] = "NaN";
    out["lte_min_rsrp_f2"] = "NaN";
    out["lte_std_rsrp_f2"] = "NaN";
    out["lte_avg_rsrq_f2"] = "NaN";
    out["lte_max_rsrq_f2"] = "NaN";
    out["lte_min_rsrq_f2"] = "NaN";
    out["lte_std_rsrq_f2"] = "NaN";
  }

  ////////
  // NR //
  ////////

  if (nrF1.length > 0) {
    const nrF1Sinr = nrF1.map(val => val.sinr);
    out["nr_avg_sinr_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Sinr)));
    out["nr_max_sinr_f1"] = math.max(nrF1Sinr);
    out["nr_min_sinr_f1"] = math.min(nrF1Sinr);
    out["nr_std_sinr_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Sinr)));

    const nrF1Rsrp = nrF1.map(val => val.rsrp);
    out["nr_avg_rsrp_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Rsrp)));
    out["nr_max_rsrp_f1"] = math.max(nrF1Rsrp);
    out["nr_min_rsrp_f1"] = math.min(nrF1Rsrp);
    out["nr_std_rsrp_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Rsrp)));

    const nrF1Rsrq = nrF1.map(val => val.rsrq);
    out["nr_avg_rsrq_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Rsrq)));
    out["nr_max_rsrq_f1"] = math.max(nrF1Rsrq);
    out["nr_min_rsrq_f1"] = math.min(nrF1Rsrq);
    out["nr_std_rsrq_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Rsrq)));
  } else {
    out["nr_avg_sinr_f1"] = "NaN";
    out["nr_max_sinr_f1"] = "NaN";
    out["nr_min_sinr_f1"] = "NaN";
    out["nr_std_sinr_f1"] = "NaN";
    out["nr_avg_rsrp_f1"] = "NaN";
    out["nr_max_rsrp_f1"] = "NaN";
    out["nr_min_rsrp_f1"] = "NaN";
    out["nr_std_rsrp_f1"] = "NaN";
    out["nr_avg_rsrq_f1"] = "NaN";
    out["nr_max_rsrq_f1"] = "NaN";
    out["nr_min_rsrq_f1"] = "NaN";
    out["nr_std_rsrq_f1"] = "NaN";
  }

  if (nrF2.length > 0) {
    const nrF2Sinr = nrF2.map(val => val.sinr);
    out["nr_avg_sinr_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Sinr)));
    out["nr_max_sinr_f2"] = math.max(nrF2Sinr);
    out["nr_min_sinr_f2"] = math.min(nrF2Sinr);
    out["nr_std_sinr_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Sinr)));

    const nrF2Rsrp = nrF2.map(val => val.rsrp);
    out["nr_avg_rsrp_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Rsrp)));
    out["nr_max_rsrp_f2"] = math.max(nrF2Rsrp);
    out["nr_min_rsrp_f2"] = math.min(nrF2Rsrp);
    out["nr_std_rsrp_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Rsrp)));

    const nrF2Rsrq = nrF2.map(val => val.rsrq);
    out["nr_avg_rsrq_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Rsrq)));
    out["nr_max_rsrq_f2"] = math.max(nrF2Rsrq);
    out["nr_min_rsrq_f2"] = math.min(nrF2Rsrq);
    out["nr_std_rsrq_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Rsrq)));
  } else {
    out["nr_avg_sinr_f2"] = "NaN";
    out["nr_max_sinr_f2"] = "NaN";
    out["nr_min_sinr_f2"] = "NaN";
    out["nr_std_sinr_f2"] = "NaN";
    out["nr_avg_rsrp_f2"] = "NaN";
    out["nr_max_rsrp_f2"] = "NaN";
    out["nr_min_rsrp_f2"] = "NaN";
    out["nr_std_rsrp_f2"] = "NaN";
    out["nr_avg_rsrq_f2"] = "NaN";
    out["nr_max_rsrq_f2"] = "NaN";
    out["nr_min_rsrq_f2"] = "NaN";
    out["nr_std_rsrq_f2"] = "NaN";
  }

  //////////
  // WiFi //
  //////////

  if (wifi2_4.length > 0) {
    const wifi2_4Rssi = wifi2_4.map(val => val.rssi);
    out["avg_rssi_of_wifi_2_4"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi2_4Rssi)));
    out["max_of_wifi_2_4"] = math.max(wifi2_4Rssi);
    out["min_of_wifi_2_4"] = math.min(wifi2_4Rssi);
    out["std_wifi_2_4_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi2_4Rssi)));
  } else {
    out["avg_rssi_of_wifi_2_4"] = "NaN";
    out["max_of_wifi_2_4"] = "NaN";
    out["min_of_wifi_2_4"] = "NaN";
    out["std_wifi_2_4_rssi"] = "NaN";
  }

  if (wifi5.length > 0) {
    const wifi5Rssi = wifi5.map(val => val.rssi);
    out["avg_rssi_of_wifi_5"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi5Rssi)));
    out["max_of_wifi_5"] = math.max(wifi5Rssi);
    out["min_of_wifi_5"] = math.min(wifi5Rssi);
    out["std_wifi_5_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi5Rssi)));
  } else {
    out["avg_rssi_of_wifi_5"] = "NaN";
    out["max_of_wifi_5"] = "NaN";
    out["min_of_wifi_5"] = "NaN";
    out["std_wifi_5_rssi"] = "NaN";
  }

  if (wifi6.length > 0) {
    const wifi6Rssi = wifi6.map(val => val.rssi);
    out["avg_rssi_of_wifi_6"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi6Rssi)));
    out["max_of_wifi_6"] = math.max(wifi6Rssi);
    out["min_of_wifi_6"] = math.min(wifi6Rssi);
    out["std_wifi_6_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi6Rssi)));
  } else {
    out["avg_rssi_of_wifi_6"] = "NaN";
    out["max_of_wifi_6"] = "NaN";
    out["min_of_wifi_6"] = "NaN";
    out["std_wifi_6_rssi"] = "NaN";
  }

  return out;
}

const linearKeys = [
  "hor_acc",
  "ver_acc",
  "num_of_lte_cell",
  "lte_num_of_f1",
  "lte_num_of_f2",
  "num_of_nr_cell",
  "nr_num_of_f1",
  "nr_num_of_f2",
  "num_of_wifi_2_4",
  "num_of_wifi_5",
  "num_of_wifi_6"
];

function reduceMean(extracted, out) {
  const keys = Object.keys(extracted[0]);
  for (let key of keys) {
    // TODO: Check with Hossein regarding NaN and -Infinity values
    const validVals = extracted.map(val => val[key]).filter(
      val => val !== "NaN" && val !== -Infinity);
    if (validVals.length === 0) {
      out[key] = 0;
    } else if (linearKeys.includes(key)) {
      out[key] = math.mean(validVals);
    } else {
      // Key contains logarithmic value
      out[key] = utils.mwToDbm(
        math.mean(utils.dbmToMw(validVals)));
    }
  }

  return out;
}

function extractConcat(entry) {
  const lteValid = entry.cell_info.map(val => {
    return {
      freq: cellHelper.earfcnToFreq(val.earfcn),
      pci: utils.cleanSignal(val.pci),
      rsrp: utils.cleanSignal(val.rsrp),
      rsrq: utils.cleanSignal(val.rsrq),
      rssi: utils.cleanSignal(val.rssi)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  // f1: freq < 1000
  let lteF1 = lteValid.filter(val => val.freq < 1000);
  // f2: 1000 < freq < 10000
  let lteF2 = lteValid.filter(val => val.freq > 1000 && val.freq < 10000);

  const nrValid = entry.nr_info.map(val => {
    return {
      freq: cellHelper.nrarfcnToFreq(val.nrarfcn),
      pci: utils.cleanSignal(val.nrPci),
      rsrp: utils.cleanSignal(val.ssRsrp),
      rsrq: utils.cleanSignal(val.ssRsrq),
      sinr: utils.cleanSignal(val.ssSinr)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  let nrF1 = nrValid.filter(val => val.freq < 1000);
  let nrF2 = nrValid.filter(val => val.freq > 1000 && val.freq < 10000);

  const wifiValid = entry.wifi_info.map(val => {
    return {
      primaryFreq: utils.cleanSignal(val.primaryFreq),
      bssid: val.bssid,
      rssi: utils.cleanSignal(val.rssi)
    };
  }).filter(val => {
    return !Object.values(val).includes("NaN");
  });
  let wifi2_4 = wifiValid.filter(val => val.primaryFreq < 5000);
  let wifi5 = wifiValid.filter(val => val.primaryFreq > 5000 && val.primaryFreq <= 5925);
  let wifi6 = wifiValid.filter(val => val.primaryFreq > 5925);

  let out = {
    "hor_acc": entry.location.hor_acc,
    "ver_acc": entry.location.ver_acc,
    "lte_f1": lteF1,
    "lte_f2": lteF2,
    "nr_f1": nrF1,
    "nr_f2": nrF2,
    "wifi_2_4": wifi2_4,
    "wifi_5": wifi5,
    "wifi_6": wifi6,
  };

  return out;
}

const idKey = {
  "lte_f1": "pci",
  "lte_f2": "pci",
  "nr_f1": "pci",
  "nr_f2": "pci",
  "wifi_2_4": "bssid",
  "wifi_5": "bssid",
  "wifi_6": "bssid"
}

function reduceConcat(extracted, out) {
  const keys = Object.keys(extracted[0]);
  const tempOut = {};
  for (const key of keys) {
    // console.log(key)
    if (linearKeys.includes(key)) {
      tempOut[key] = extracted.map(val => val[key]).filter(
          val => val !== "NaN" && val !== -Infinity);
    } else {
      const flattened = extracted.map(val => val[key]).flat();
      // console.log(flattened)
      const groupById = Object.groupBy(
        flattened,
        entry => entry[idKey[key]]);
      const meanPerId = Object.values(
        groupById
      ).map(entries => {
        // console.log(entries)
        const meanOfEntries = {};
        for (const key in entries[0]) {
          if (["rssi", "rsrp", "rsrq", "sinr"].includes(key)) {
            const vals = entries.map(entry => entry[key]);
            meanOfEntries[key] = utils.mwToDbm(math.mean(utils.dbmToMw(vals)));
          }
        }
        return meanOfEntries;
      }).filter(val => {
        return Object.values(val).length > 0;
      })

      tempOut[key] = meanPerId;
    }
  }
  // console.log(tempOut)

  out["hor_acc"] = math.mean(tempOut["hor_acc"]);
  out["ver_acc"] = math.mean(tempOut["ver_acc"]);
  out["num_of_lte_cell"] = tempOut["lte_f1"].length + tempOut["lte_f2"].length;
  out["lte_num_of_f1"] = tempOut["lte_f1"].length;
  out["lte_num_of_f2"] = tempOut["lte_f2"].length;
  out["num_of_nr_cell"] = tempOut["nr_f1"].length + tempOut["nr_f2"].length;;
  out["nr_num_of_f1"] = tempOut["nr_f1"].length;
  out["nr_num_of_f2"] = tempOut["nr_f2"].length;
  out["num_of_wifi_2_4"] = tempOut["wifi_2_4"].length;
  out["num_of_wifi_5"] = tempOut["wifi_5"].length;
  out["num_of_wifi_6"] = tempOut["wifi_6"].length;

  /////////
  // LTE //
  /////////

  const lteF1 = tempOut["lte_f1"];
  if (lteF1.length > 0) {
    const lteF1Rssi = lteF1.map(val => val.rssi);
    out["lte_avg_rssi_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rssi)));
    out["lte_max_rssi_f1"] = math.max(lteF1Rssi);
    out["lte_min_rssi_f1"] = math.min(lteF1Rssi);
    out["lte_std_rssi_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rssi)));

    const lteF1Rsrp = lteF1.map(val => val.rsrp);
    out["lte_avg_rsrp_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rsrp)));
    out["lte_max_rsrp_f1"] = math.max(lteF1Rsrp);
    out["lte_min_rsrp_f1"] = math.min(lteF1Rsrp);
    out["lte_std_rsrp_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rsrp)));

    const lteF1Rsrq = lteF1.map(val => val.rsrq);
    out["lte_avg_rsrq_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF1Rsrq)));
    out["lte_max_rsrq_f1"] = math.max(lteF1Rsrq);
    out["lte_min_rsrq_f1"] = math.min(lteF1Rsrq);
    out["lte_std_rsrq_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF1Rsrq)));
  } else {
    out["lte_avg_rssi_f1"] = 0;
    out["lte_max_rssi_f1"] = 0;
    out["lte_min_rssi_f1"] = 0;
    out["lte_std_rssi_f1"] = 0;
    out["lte_avg_rsrp_f1"] = 0;
    out["lte_max_rsrp_f1"] = 0;
    out["lte_min_rsrp_f1"] = 0;
    out["lte_std_rsrp_f1"] = 0;
    out["lte_avg_rsrq_f1"] = 0;
    out["lte_max_rsrq_f1"] = 0;
    out["lte_min_rsrq_f1"] = 0;
    out["lte_std_rsrq_f1"] = 0;
  }

  const lteF2 = tempOut["lte_f2"];
  if (lteF2.length > 0) {
    const lteF2Rssi = lteF2.map(val => val.rssi);
    out["lte_avg_rssi_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rssi)));
    out["lte_max_rssi_f2"] = math.max(lteF2Rssi);
    out["lte_min_rssi_f2"] = math.min(lteF2Rssi);
    out["lte_std_rssi_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rssi)));

    const lteF2Rsrp = lteF2.map(val => val.rsrp);
    out["lte_avg_rsrp_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rsrp)));
    out["lte_max_rsrp_f2"] = math.max(lteF2Rsrp);
    out["lte_min_rsrp_f2"] = math.min(lteF2Rsrp);
    out["lte_std_rsrp_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rsrp)));

    const lteF2Rsrq = lteF2.map(val => val.rsrq);
    out["lte_avg_rsrq_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(lteF2Rsrq)));
    out["lte_max_rsrq_f2"] = math.max(lteF2Rsrq);
    out["lte_min_rsrq_f2"] = math.min(lteF2Rsrq);
    out["lte_std_rsrq_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(lteF2Rsrq)));
  } else {
    out["lte_avg_rssi_f2"] = 0;
    out["lte_max_rssi_f2"] = 0;
    out["lte_min_rssi_f2"] = 0;
    out["lte_std_rssi_f2"] = 0;
    out["lte_avg_rsrp_f2"] = 0;
    out["lte_max_rsrp_f2"] = 0;
    out["lte_min_rsrp_f2"] = 0;
    out["lte_std_rsrp_f2"] = 0;
    out["lte_avg_rsrq_f2"] = 0;
    out["lte_max_rsrq_f2"] = 0;
    out["lte_min_rsrq_f2"] = 0;
    out["lte_std_rsrq_f2"] = 0;
  }

  ////////
  // NR //
  ////////

  const nrF1 = tempOut["nr_f1"];
  if (nrF1.length > 0) {
    const nrF1Sinr = nrF1.map(val => val.sinr);
    out["nr_avg_sinr_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Sinr)));
    out["nr_max_sinr_f1"] = math.max(nrF1Sinr);
    out["nr_min_sinr_f1"] = math.min(nrF1Sinr);
    out["nr_std_sinr_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Sinr)));

    const nrF1Rsrp = nrF1.map(val => val.rsrp);
    out["nr_avg_rsrp_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Rsrp)));
    out["nr_max_rsrp_f1"] = math.max(nrF1Rsrp);
    out["nr_min_rsrp_f1"] = math.min(nrF1Rsrp);
    out["nr_std_rsrp_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Rsrp)));

    const nrF1Rsrq = nrF1.map(val => val.rsrq);
    out["nr_avg_rsrq_f1"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF1Rsrq)));
    out["nr_max_rsrq_f1"] = math.max(nrF1Rsrq);
    out["nr_min_rsrq_f1"] = math.min(nrF1Rsrq);
    out["nr_std_rsrq_f1"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF1Rsrq)));
  } else {
    out["nr_avg_sinr_f1"] = 0;
    out["nr_max_sinr_f1"] = 0;
    out["nr_min_sinr_f1"] = 0;
    out["nr_std_sinr_f1"] = 0;
    out["nr_avg_rsrp_f1"] = 0;
    out["nr_max_rsrp_f1"] = 0;
    out["nr_min_rsrp_f1"] = 0;
    out["nr_std_rsrp_f1"] = 0;
    out["nr_avg_rsrq_f1"] = 0;
    out["nr_max_rsrq_f1"] = 0;
    out["nr_min_rsrq_f1"] = 0;
    out["nr_std_rsrq_f1"] = 0;
  }

  const nrF2 = tempOut["nr_f2"];
  if (nrF2.length > 0) {
    const nrF2Sinr = nrF2.map(val => val.sinr);
    out["nr_avg_sinr_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Sinr)));
    out["nr_max_sinr_f2"] = math.max(nrF2Sinr);
    out["nr_min_sinr_f2"] = math.min(nrF2Sinr);
    out["nr_std_sinr_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Sinr)));

    const nrF2Rsrp = nrF2.map(val => val.rsrp);
    out["nr_avg_rsrp_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Rsrp)));
    out["nr_max_rsrp_f2"] = math.max(nrF2Rsrp);
    out["nr_min_rsrp_f2"] = math.min(nrF2Rsrp);
    out["nr_std_rsrp_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Rsrp)));

    const nrF2Rsrq = nrF2.map(val => val.rsrq);
    out["nr_avg_rsrq_f2"] = utils.mwToDbm(math.mean(utils.dbmToMw(nrF2Rsrq)));
    out["nr_max_rsrq_f2"] = math.max(nrF2Rsrq);
    out["nr_min_rsrq_f2"] = math.min(nrF2Rsrq);
    out["nr_std_rsrq_f2"] = utils.mwToDbm(math.std(utils.dbmToMw(nrF2Rsrq)));
  } else {
    out["nr_avg_sinr_f2"] = 0;
    out["nr_max_sinr_f2"] = 0;
    out["nr_min_sinr_f2"] = 0;
    out["nr_std_sinr_f2"] = 0;
    out["nr_avg_rsrp_f2"] = 0;
    out["nr_max_rsrp_f2"] = 0;
    out["nr_min_rsrp_f2"] = 0;
    out["nr_std_rsrp_f2"] = 0;
    out["nr_avg_rsrq_f2"] = 0;
    out["nr_max_rsrq_f2"] = 0;
    out["nr_min_rsrq_f2"] = 0;
    out["nr_std_rsrq_f2"] = 0;
  }

  //////////
  // WiFi //
  //////////

  const wifi2_4 = tempOut["wifi_2_4"];
  if (wifi2_4.length > 0) {
    const wifi2_4Rssi = wifi2_4.map(val => val.rssi);
    out["avg_rssi_of_wifi_2_4"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi2_4Rssi)));
    out["max_of_wifi_2_4"] = math.max(wifi2_4Rssi);
    out["min_of_wifi_2_4"] = math.min(wifi2_4Rssi);
    out["std_wifi_2_4_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi2_4Rssi)));
  } else {
    out["avg_rssi_of_wifi_2_4"] = 0;
    out["max_of_wifi_2_4"] = 0;
    out["min_of_wifi_2_4"] = 0;
    out["std_wifi_2_4_rssi"] = 0;
  }

  const wifi5 = tempOut["wifi_5"];
  if (wifi5.length > 0) {
    const wifi5Rssi = wifi5.map(val => val.rssi);
    out["avg_rssi_of_wifi_5"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi5Rssi)));
    out["max_of_wifi_5"] = math.max(wifi5Rssi);
    out["min_of_wifi_5"] = math.min(wifi5Rssi);
    out["std_wifi_5_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi5Rssi)));
  } else {
    out["avg_rssi_of_wifi_5"] = 0;
    out["max_of_wifi_5"] = 0;
    out["min_of_wifi_5"] = 0;
    out["std_wifi_5_rssi"] = 0;
  }

  const wifi6 = tempOut["wifi_6"];
  if (wifi6.length > 0) {
    const wifi6Rssi = wifi6.map(val => val.rssi);
    out["avg_rssi_of_wifi_6"] = utils.mwToDbm(math.mean(utils.dbmToMw(wifi6Rssi)));
    out["max_of_wifi_6"] = math.max(wifi6Rssi);
    out["min_of_wifi_6"] = math.min(wifi6Rssi);
    out["std_wifi_6_rssi"] = utils.mwToDbm(math.std(utils.dbmToMw(wifi6Rssi)));
  } else {
    out["avg_rssi_of_wifi_6"] = 0;
    out["max_of_wifi_6"] = 0;
    out["min_of_wifi_6"] = 0;
    out["std_wifi_6_rssi"] = 0;
  }

  return out;
}


const csv = {
  toCsv: function(objArr, sep=",") {
    let outStr = Object.keys(objArr[0]).join(sep) + `\n`

    for (let entry of objArr) {
      outStr += Object.values(entry).join(sep) + `\n`
    }

    return outStr
  },

  general: function(sigcapJson) {
    console.log(`Processing general CSV... # data= ${sigcapJson.length}`)

    // Do one loop to check maximum number of cells and APs
    let max_lte = -1
    let max_nr = -1
    let max_wifi_2_4 = -1
    let max_wifi_5 = -1
    let max_wifi_6 = -1

    for (let entry of sigcapJson) {
      // Get max LTE cells
      if (max_lte < entry.cell_info.length) {
        max_lte = entry.cell_info.length
      }

      // Get max NR cells
      if (entry.nr_info) {
        if (max_nr < entry.nr_info.length) {
          max_nr = entry.nr_info.length
        }
      }

      // Get max Wi-Fi APs
      let wifiCodes = entry.wifi_info.filter(val => !val.connected)
        .map(val => wifiHelper.getFreqCode(val.primaryFreq))
      let wifi_2_4_count = wifiCodes.filter(val => val === "2.4").length
      let wifi_5_count = wifiCodes.filter(val => val === "5").length
      let wifi_6_count = wifiCodes.filter(val => val === "6").length
      if (max_wifi_2_4 < wifi_2_4_count) {
        max_wifi_2_4 = wifi_2_4_count
      }
      if (max_wifi_5 < wifi_5_count) {
        max_wifi_5 = wifi_5_count
      }
      if (max_wifi_6 < wifi_6_count) {
        max_wifi_6 = wifi_6_count
      }
    }

    console.log(
      `max_lte= ${max_lte};`,
      `max_nr= ${max_nr};`,
      `max_wifi_2_4= ${max_wifi_2_4};`,
      `max_wifi_5= ${max_wifi_5};`,
      `max_wifi_6= ${max_wifi_6};`
    )

    outputArr = []
    deviceTimedata = {}

    for (let entry of sigcapJson) {
      // Overview
      let tempOut = {
        "timestamp": utils.getCleanDatetime(entry),
        "sigcap_version": entry.version,
        "android_version": entry.androidVersion,
        "is_debug": entry.isDebug,
        "uuid": entry.uuid,
        "device_name": entry.deviceName,
        "latitude": entry.location.latitude,
        "longitude": entry.location.longitude,
        "altitude": entry.location.altitude,
        "hor_acc": entry.location.hor_acc,
        "ver_acc": entry.location.ver_acc,
        "operator": utils.getCleanOp(entry),
        "network_type*": utils.getActiveNetwork(entry),
        "override_network_type": entry.overrideNetworkType,
        "radio_type": entry.phoneType,
        "nrStatus": entry.nrStatus,
        "nrAvailable": entry.nrAvailable,
        "dcNrRestricted": entry.dcNrRestricted,
        "enDcAvailable": entry.enDcAvailable,
        "nrFrequencyRange": entry.nrFrequencyRange,
        "cellBandwidths": `"${entry.cellBandwidths}"`,
        "usingCA": entry.usingCA,
      }

      // Sensor
      if (entry.sensor) {
        tempOut["sensor.deviceTempC"] = entry.sensor.deviceTempC
        tempOut["sensor.ambientTempC"] = entry.sensor.ambientTempC
        tempOut["sensor.accelXMs2"] = entry.sensor.accelXMs2
        tempOut["sensor.accelYMs2"] = entry.sensor.accelYMs2
        tempOut["sensor.accelZMs2"] = entry.sensor.accelZMs2
        tempOut["sensor.battPresent"] = entry.sensor.battPresent
        tempOut["sensor.battStatus"] = entry.sensor.battStatus
        tempOut["sensor.battTechnology"] = entry.sensor.battTechnology
        tempOut["sensor.battCapPerc"] = entry.sensor.battCapPerc
        tempOut["sensor.battTempC"] = entry.sensor.battTempC
        tempOut["sensor.battChargeUah"] = entry.sensor.battChargeUah
        tempOut["sensor.battVoltageMv"] = entry.sensor.battVoltageMv
        tempOut["sensor.battCurrNowUa"] = entry.sensor.battCurrNowUa
        tempOut["sensor.battCurrAveUa"] = entry.sensor.battCurrAveUa
      }

      // iperf
      if (entry.iperf_info && entry.iperf_info.length > 0) {
        iperfTputs = entry.iperf_info.map(val => val.tputMbps)
        tempOut["iperf_tput_mean_mbps"] = math.mean(iperfTputs)
        tempOut["iperf_tput_stddev_mbps"] = math.std(iperfTputs)
        tempOut["iperf_target"] =
          entry.iperf_info.map(val => val.target)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
        tempOut["iperf_direction"] =
          entry.iperf_info.map(val => val.direction)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
        tempOut["iperf_protocol"] =
          entry.iperf_info.map(val => val.protocol)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
      } else {
        tempOut["iperf_tput_mean_mbps"] = "NaN"
        tempOut["iperf_tput_stddev_mbps"] = "NaN"
        tempOut["iperf_target"] = "N/A"
        tempOut["iperf_direction"] = "N/A"
        tempOut["iperf_protocol"] = "N/A"
      }

      // ping
      if (entry.ping_info && entry.ping_info.length > 0) {
        pingRtts = entry.ping_info.map(val => val.time)
        tempOut["ping_rtt_mean_ms"] = math.mean(pingRtts)
        tempOut["ping_rtt_stddev_ms"] = math.std(pingRtts)
        tempOut["ping_target"] =
          entry.ping_info.map(val => val.target)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
      } else {
        tempOut["ping_rtt_mean_ms"] = "NaN"
        tempOut["ping_rtt_stddev_ms"] = "NaN"
        tempOut["ping_target"] = "N/A"
      }

      // HTTP GET
      if (entry.http_info) {
        if (entry.http_info.durationNano > 0) {
          tempOut["http_tput_mean_mbps"] =
            entry.http_info.bytesDownloaded * 8e3
              / entry.http_info.durationNano
        } else {
          tempOut["http_tput_mean_mbps"] = "NaN"
        }
        tempOut["http_target"] = entry.http_info.targetUrl ? entry.http_info.targetUrl : "N/A"
      } else {
        tempOut["http_tput_mean_mbps"] = "NaN"
        tempOut["http_target"] = "N/A"
      }

      // Handle older version without nr_info
      if (entry.nr_info === undefined) {
        entry.nr_info = []
      }

      // Count of LTE cells
      tempOut["lte_count"] = entry.cell_info.length
      // Count of NR cells
      tempOut["nr_count"] = entry.nr_info.length
      // Count of 2.4 GHz Wi-Fi
      tempOut["wifi_2.4_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "2.4").length
      // Count of 5 GHz Wi-Fi
      tempOut["wifi_5_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "5").length
      // Count of 6 GHz Wi-Fi
      tempOut["wifi_6_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "6").length

      // LTE primary
      let ltePrimary = entry.cell_info.find(val => (val.width > 0 || val.registered))
      if (ltePrimary) {
        tempOut["lte_primary_pci"] = utils.cleanSignal(ltePrimary.pci)
        tempOut["lte_primary_ci"] = utils.cleanSignal(ltePrimary.ci)
        tempOut["lte_primary_earfcn"] = utils.cleanSignal(
          ltePrimary.earfcn)
        tempOut["lte_primary_band*"] = cellHelper.earfcnToBand(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_freq_mhz*"] = cellHelper.earfcnToFreq(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_width_mhz"] = utils.cleanSignal(
          ltePrimary.width / 1000)
        tempOut["lte_primary_rsrp_dbm"] = utils.cleanSignal(
          ltePrimary.rsrp)
        tempOut["lte_primary_rsrq_db"] = utils.cleanSignal(
          ltePrimary.rsrq)
        tempOut["lte_primary_cqi"] = utils.cleanSignal(
          ltePrimary.cqi)
        tempOut["lte_primary_rssi_dbm"] = utils.cleanSignal(
          ltePrimary.rssi)
        tempOut["lte_primary_rssnr_db"] = utils.cleanSignal(
          ltePrimary.rssnr)
        tempOut["lte_primary_timing"] = utils.cleanSignal(
          ltePrimary.timing)
      } else {
        tempOut["lte_primary_pci"] = "NaN"
        tempOut["lte_primary_ci"] = "NaN"
        tempOut["lte_primary_earfcn"] = "NaN"
        tempOut["lte_primary_band*"] = "N/A"
        tempOut["lte_primary_freq_mhz*"] = "NaN"
        tempOut["lte_primary_width_mhz"] = "NaN"
        tempOut["lte_primary_rsrp_dbm"] = "NaN"
        tempOut["lte_primary_rsrq_db"] = "NaN"
        tempOut["lte_primary_cqi"] = "NaN"
        tempOut["lte_primary_rssi_dbm"] = "NaN"
        tempOut["lte_primary_rssnr_db"] = "NaN"
        tempOut["lte_primary_timing"] = "NaN"
      }

      // NR primary
      let nrPrimary = entry.nr_info.find(val => val.status === "primary")
      if (nrPrimary === undefined && entry.nr_info.length > 0) {
        nrPrimary = entry.nr_info[0]
      }
      if (nrPrimary) {
        tempOut["nr_first_is_primary"] = (nrPrimary.status === "primary")
        tempOut["nr_first_is_signalStrAPI"] = nrPrimary.isSignalStrAPI
        tempOut["nr_first_pci"] = utils.cleanSignal(
          nrPrimary.nrPci)
        tempOut["nr_first_nci"] = utils.cleanSignal(
          nrPrimary.nci)
        tempOut["nr_first_arfcn"] = utils.cleanSignal(
          nrPrimary.nrarfcn)
        tempOut["nr_first_band*"] = cellHelper.nrarfcnToBand(
          tempOut["nr_first_arfcn"],
          cellHelper.REGION.NAR)
        tempOut["nr_first_freq_mhz*"] = cellHelper.nrarfcnToFreq(
          tempOut["nr_first_arfcn"])
        tempOut["nr_first_ss_rsrp_dbm"] = utils.cleanSignal(
          nrPrimary.ssRsrp)
        tempOut["nr_first_ss_rsrq_db"] = utils.cleanSignal(
          nrPrimary.ssRsrq)
        tempOut["nr_first_ss_sinr_db"] = utils.cleanSignal(
          nrPrimary.ssSinr)
        tempOut["nr_first_csi_rsrp_dbm"] = utils.cleanSignal(
          nrPrimary.csiRsrp)
        tempOut["nr_first_csi_rsrq_db"] = utils.cleanSignal(
          nrPrimary.csiRsrq)
        tempOut["nr_first_csi_sinr_db"] = utils.cleanSignal(
          nrPrimary.csiSinr)
      } else {
        tempOut["nr_first_is_primary"] = "N/A"
        tempOut["nr_first_is_signalStrAPI"] = "N/A"
        tempOut["nr_first_pci"] = "NaN"
        tempOut["nr_first_nci"] = "NaN"
        tempOut["nr_first_arfcn"] = "NaN"
        tempOut["nr_first_band*"] = "N/A"
        tempOut["nr_first_freq_mhz*"] = "NaN"
        tempOut["nr_first_ss_rsrp_dbm"] = "NaN"
        tempOut["nr_first_ss_rsrq_db"] = "NaN"
        tempOut["nr_first_ss_sinr_db"] = "NaN"
        tempOut["nr_first_csi_rsrp_dbm"] = "NaN"
        tempOut["nr_first_csi_rsrq_db"] = "NaN"
        tempOut["nr_first_csi_sinr_db"] = "NaN"
      }

      // NR others
      let nrIdx = 1
      let nrOthers =
        entry.nr_info.filter(val => val !== nrPrimary)
          .sort((a, b) => b.ssRsrp - a.ssRsrp)
      for (let nrEntry of nrOthers) {
        if (nrIdx >= max_nr) {
          break;
        }
        tempOut[`nr_other${nrIdx}_pci`] = utils.cleanSignal(
          nrEntry.nrPci)
        tempOut[`nr_other${nrIdx}_arfcn`] = utils.cleanSignal(
          nrEntry.nrarfcn)
        tempOut[`nr_other${nrIdx}_band*`] = cellHelper.nrarfcnToBand(
          tempOut[`nr_other${nrIdx}_arfcn`],
          reg=cellHelper.REGION.NAR)
        tempOut[`nr_other${nrIdx}_freq_mhz*`] = cellHelper.nrarfcnToFreq(
          tempOut[`nr_other${nrIdx}_arfcn`])
        tempOut[`nr_other${nrIdx}_ss_rsrp_dbm`] = utils.cleanSignal(
          nrEntry.ssRsrp)
        tempOut[`nr_other${nrIdx}_ss_rsrq_db`] = utils.cleanSignal(
          nrEntry.ssRsrq)
        tempOut[`nr_other${nrIdx}_csi_rsrp_dbm`] = utils.cleanSignal(
          nrEntry.csiRsrp)
        tempOut[`nr_other${nrIdx}_csi_rsrq_db`] = utils.cleanSignal(
          nrEntry.csiRsrq)
        tempOut[`nr_other${nrIdx}_is_signalStrAPI`] = nrEntry.isSignalStrAPI
        nrIdx += 1
      }
      while (nrIdx < max_nr) {
        tempOut[`nr_other${nrIdx}_pci`] = "NaN"
        tempOut[`nr_other${nrIdx}_arfcn`] = "NaN"
        tempOut[`nr_other${nrIdx}_band*`] = "N/A"
        tempOut[`nr_other${nrIdx}_freq_mhz*`] = "NaN"
        tempOut[`nr_other${nrIdx}_ss_rsrp_dbm`] = "NaN"
        tempOut[`nr_other${nrIdx}_ss_rsrq_db`] = "NaN"
        tempOut[`nr_other${nrIdx}_csi_rsrp_dbm`] = "NaN"
        tempOut[`nr_other${nrIdx}_csi_rsrq_db`] = "NaN"
        tempOut[`nr_other${nrIdx}_is_signalStrAPI`] = "N/A"
        nrIdx += 1
      }

      // LTE others
      let lteIdx = 1
      let lteOthers =
        entry.cell_info.filter(val => val !== ltePrimary)
          .sort((a, b) => b.rsrp - a.rsrp)
      for (let lteEntry of lteOthers) {
        if (lteIdx >= max_lte) {
          break;
        }
        tempOut[`lte_other${lteIdx}_pci`] = utils.cleanSignal(lteEntry.pci)
        tempOut[`lte_other${lteIdx}_earfcn`] = utils.cleanSignal(
            lteEntry.earfcn)
        tempOut[`lte_other${lteIdx}_band*`] = cellHelper.earfcnToBand(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_freq_mhz*`] = cellHelper.earfcnToFreq(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_rsrp_dbm`] = utils.cleanSignal(
            lteEntry.rsrp)
        tempOut[`lte_other${lteIdx}_rsrq_db`] = utils.cleanSignal(
            lteEntry.rsrq)
        tempOut[`lte_other${lteIdx}_cqi`] = utils.cleanSignal(
            lteEntry.cqi)
        tempOut[`lte_other${lteIdx}_rssi_dbm`] = utils.cleanSignal(
            lteEntry.rssi)
        tempOut[`lte_other${lteIdx}_rssnr_db`] = utils.cleanSignal(
            lteEntry.rssnr)
        lteIdx += 1
      }
      while (lteIdx < max_lte) {
        tempOut[`lte_other${lteIdx}_pci`] = "NaN"
        tempOut[`lte_other${lteIdx}_earfcn`] = "NaN"
        tempOut[`lte_other${lteIdx}_band*`] = "N/A"
        tempOut[`lte_other${lteIdx}_freq_mhz*`] = "NaN"
        tempOut[`lte_other${lteIdx}_rsrp_dbm`] = "NaN"
        tempOut[`lte_other${lteIdx}_rsrq_db`] = "NaN"
        tempOut[`lte_other${lteIdx}_cqi`] = "NaN"
        tempOut[`lte_other${lteIdx}_rssi_dbm`] = "NaN"
        tempOut[`lte_other${lteIdx}_rssnr_db`] = "NaN"
        lteIdx += 1
      }

      // Wi-Fi connected
      let wifiConnected = entry.wifi_info.find(val => val.connected)
      if (wifiConnected) {
        tempOut["wifi_connected_ssid"] = wifiConnected.ssid ? `"${wifiConnected.ssid}"` : ""
        tempOut["wifi_connected_bssid"] = wifiConnected.bssid
        tempOut["wifi_connected_primary_freq_mhz"] = wifiConnected.primaryFreq
        if (wifiConnected.centerFreq1) {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.centerFreq1
        } else if (wifiConnected.centerFreq0) {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.centerFreq0
        } else {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.primaryFreq
        }
        tempOut["wifi_connected_primary_ch*"] = wifiHelper.freqWidthToChannelNum(
          wifiConnected.primaryFreq, 20)
        if (wifiConnected.width > 0) {
          tempOut["wifi_connected_ch_num*"] = wifiHelper.freqWidthToChannelNum(
            wifiConnected.primaryFreq, wifiConnected.width)
        } else {
          tempOut["wifi_connected_ch_num*"] = tempOut["wifi_connected_primary_ch*"]
        }
        tempOut["wifi_connected_bw_mhz"] = (wifiConnected.width > 0) ? wifiConnected.width : 20
        tempOut["wifi_connected_rssi_dbm"] = utils.cleanSignal(
          wifiConnected.rssi)
        tempOut["wifi_connected_standard"] = wifiConnected.standard
        tempOut["wifi_connected_tx_link_speed_mbps"] = wifiConnected.txLinkSpeed
        tempOut["wifi_connected_rx_link_speed_mbps"] = wifiConnected.rxLinkSpeed
        tempOut["wifi_connected_max_tx_link_speed_mbps"] = wifiConnected.maxSupportedTxLinkSpeed
        tempOut["wifi_connected_max_rx_link_speed_mbps"] = wifiConnected.maxSupportedRxLinkSpeed
        tempOut["wifi_connected_sta_count"] = utils.cleanSignal(
          wifiConnected.staCount)
        if (tempOut["wifi_connected_sta_count"] === -1) {
          tempOut["wifi_connected_sta_count"] = "NaN"
        }
        tempOut["wifi_connected_ch_util"] = utils.cleanSignal(
          wifiConnected.chUtil)
        if (tempOut["wifi_connected_ch_util"] === -1) {
          tempOut["wifi_connected_ch_util"] = "NaN"
        }
        tempOut["wifi_connected_tx_power_dbm"] = utils.cleanSignal(
          wifiConnected.txPower)
        tempOut["wifi_connected_link_margin_db"] = utils.cleanSignal(
          wifiConnected.linkMargin)
        tempOut["wifi_connected_alphanumeric_ap_name"] = wifiConnected.apName ? wifiConnected.apName : "unknown"
      } else {
        tempOut["wifi_connected_ssid"] = "N/A"
        tempOut["wifi_connected_bssid"] = "N/A"
        tempOut["wifi_connected_primary_freq_mhz"] = "NaN"
        tempOut["wifi_connected_center_freq_mhz"] = "NaN"
        tempOut["wifi_connected_primary_ch*"] = "NaN"
        tempOut["wifi_connected_ch_num*"] = "NaN"
        tempOut["wifi_connected_bw_mhz"] = "NaN"
        tempOut["wifi_connected_rssi_dbm"] = "NaN"
        tempOut["wifi_connected_standard"] = "N/A"
        tempOut["wifi_connected_tx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_rx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_max_tx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_max_rx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_sta_count"] = "NaN"
        tempOut["wifi_connected_ch_util"] = "NaN"
        tempOut["wifi_connected_tx_power_dbm"] = "NaN"
        tempOut["wifi_connected_link_margin_db"] = "NaN"
        tempOut["wifi_connected_alphanumeric_ap_name"] = "unknown"
      }

      // Wi-Fi others 2.4 GHz
      let wifiOthers2_4 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "2.4")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_2.4_other_count"] = wifiOthers2_4.length
      rssi2_4_mw = wifiOthers2_4.map(val => utils.dbmToMw(val.rssi))
      if (rssi2_4_mw.length > 0) {
        tempOut["wifi_2.4_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi2_4_mw))
        tempOut["wifi_2.4_other_stddev_rssi_mW"] = math.std(rssi2_4_mw)
      } else {
        tempOut["wifi_2.4_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_2.4_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi2_4Idx = 1
      for (let wifiEntry of wifiOthers2_4) {
        if (wifi2_4Idx > max_wifi_2_4) {
          break;
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`]
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_2.4_other${wifi2_4Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] === -1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] === -1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi2_4Idx += 1
      }
      while (wifi2_4Idx <= max_wifi_2_4) {
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ssid`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bssid`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_standard`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_alphanumeric_ap_name`] = "unknown"
        wifi2_4Idx += 1
      }

      // Wi-Fi others 5 GHz
      let wifiOthers5 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "5")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_5_other_count"] = wifiOthers5.length
      rssi5_mw = wifiOthers5.map(val => utils.dbmToMw(val.rssi))
      if (rssi5_mw.length > 0) {
        tempOut["wifi_5_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi5_mw))
        tempOut["wifi_5_other_stddev_rssi_mW"] = math.std(rssi5_mw)
      } else {
        tempOut["wifi_5_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_5_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi5Idx = 1
      for (let wifiEntry of wifiOthers5) {
        if (wifi5Idx > max_wifi_5) {
          break;
        }
        tempOut[`wifi_5_other${wifi5Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_5_other${wifi5Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_5_other${wifi5Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`]
        }
        tempOut[`wifi_5_other${wifi5Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_5_other${wifi5Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_5_other${wifi5Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_5_other${wifi5Idx}_sta_count`] === -1) {
          tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_5_other${wifi5Idx}_ch_util`] === -1) {
          tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_5_other${wifi5Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_5_other${wifi5Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_5_other${wifi5Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi5Idx += 1
      }
      while (wifi5Idx <= max_wifi_5) {
        tempOut[`wifi_5_other${wifi5Idx}_ssid`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_bssid`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_standard`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_alphanumeric_ap_name`] = "unknown"
        wifi5Idx += 1
      }

      // Wi-Fi others 6 GHz
      let wifiOthers6 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "6")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_6_other_count"] = wifiOthers6.length
      rssi6_mw = wifiOthers6.map(val => utils.dbmToMw(val.rssi))
      if (rssi6_mw.length > 0) {
        tempOut["wifi_6_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi6_mw))
        tempOut["wifi_6_other_stddev_rssi_mW"] = math.std(rssi6_mw)
      } else {
        tempOut["wifi_6_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_6_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi6Idx = 1
      for (let wifiEntry of wifiOthers6) {
        if (wifi6Idx > max_wifi_6) {
          break;
        }
        tempOut[`wifi_6_other${wifi6Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_6_other${wifi6Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_6_other${wifi6Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`]
        }
        tempOut[`wifi_6_other${wifi6Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_6_other${wifi6Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_6_other${wifi6Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_6_other${wifi6Idx}_sta_count`] === -1) {
          tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_6_other${wifi6Idx}_ch_util`] === -1) {
          tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_6_other${wifi6Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_6_other${wifi6Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_6_other${wifi6Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi6Idx += 1
      }
      while (wifi6Idx <= max_wifi_6) {
        tempOut[`wifi_6_other${wifi6Idx}_ssid`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_bssid`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_standard`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_alphanumeric_ap_name`] = "unknown"
        wifi6Idx += 1
      }

      outputArr.push(tempOut)
    }

    console.log(`# general entries= ${outputArr.length}`)
    // console.log(outputArr)
    if (outputArr.length === 0) {
      return ""
    } else {
      return this.toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
    }
  },

  ml: function(sigcapJson, aggMethod = "mean", intervalSec = 5) {
    console.log(`Processing ML CSV... # data= ${sigcapJson.length}`)

    let outputArr = [];
    const usualCarriers = [
      "AT&T",
      "T-Mobile",
      "Verizon"
    ];

    const uniqueUuids = sigcapJson.filter(entry => {
      return usualCarriers.includes(utils.getCleanOp(entry));
    }).reduce((prev, curr) => {
      if (!prev.includes(curr.uuid)) {
        prev.push(curr.uuid);
      }
      return prev;
    }, []);

    // Process the date per unique UUID.
    for (let uuid of uniqueUuids) {
      const uuidJson = sigcapJson.filter(val => val.uuid === uuid);

      // Group entries based on timestamp ms
      const grouped = Object.groupBy(uuidJson, entry => {
        let timestamp = new Date(utils.getCleanDatetime(entry));
        return Math.floor(timestamp.getTime() / 1000 / intervalSec);
      });

      const processed = Object.values(grouped).map(entries => {
        // Put the first entry as the representative operator and timestamp
        let operator = utils.getCleanOp(entries[0]);
        let operatorIdx = (operator === "AT&T") ? 0 : (operator === "T-Mobile") ? 1 : 2;
        let timestamp = new Date(utils.getCleanDatetime(entries[0]));

        // Extract LTE/NR/Wi-Fi attributes from entries
        let extracted = null;
        if (aggMethod === "mean") {
          extracted = entries.map(extractMean);
        } else if (aggMethod === "concat") {
          extracted = entries.map(extractConcat);
        } else {
          throw new Error(`Unknown aggregation method ${aggMethod} !`);
        }

        let groupedOut = {
          "year": timestamp.getYear() + 1900,
          "month": timestamp.getMonth() + 1,
          "day": timestamp.getDate(),
          "time_counter": (timestamp.getMilliseconds() / 1e3
            + timestamp.getSeconds()
            + 60 * timestamp.getMinutes()
            + 60 * 60 * timestamp.getHours()),
          "operator": operatorIdx,
        };

        // Collapse all extracted entries into one.
        if (aggMethod === "mean") {
          groupedOut = reduceMean(extracted, groupedOut);
        } else if (aggMethod === "concat") {
          groupedOut = reduceConcat(extracted, groupedOut);
        } else {
          throw new Error(`Unknown aggregation method ${aggMethod} !`);
        }

        return groupedOut;
      });

      outputArr = outputArr.concat(processed);
    }

    return outputArr;
  },

  psqlToCellJson: function (entry) {
    // console.log(entry)
    let actualTimestamp = entry.timestampMs;
    if (actualTimestamp === null) {
      if (entry.timestampDeltaMs !== null) {
        actualTimestamp = entry.data_timestamp.getTime() - entry.timestampDeltaMs;
      } else {
        actualTimestamp = entry.data_timestamp.getTime();
      }
    }

    let arfcn = utils.cleanSignal(entry.earfcn);

    return {
      "timestamp": utils.printDateTime(actualTimestamp),
      "sigcap_version": entry.version,
      "android_version": entry.androidVersion,
      "is_debug": entry.isDebug,
      "uuid": entry.uuid,
      "device_name": entry.deviceName,
      "latitude": entry.latitude,
      "longitude": entry.longitude,
      "altitude": entry.altitude,
      "hor_acc": entry.hor_acc,
      "ver_acc": entry.ver_acc,
      "operator": utils.getCleanOp(entry),
      "network_type*": utils.getActiveNetwork(entry),
      "override_network_type": entry.overrideNetworkType,
      "radio_type": entry.phoneType,
      "nrStatus": entry.nrStatus,
      "nrAvailable": entry.nrAvailable,
      "dcNrRestricted": entry.dcNrRestricted,
      "enDcAvailable": entry.enDcAvailable,
      "nrFrequencyRange": entry.nrFrequencyRange,
      "cellBandwidths": `"${entry.cellBandwidths}"`,
      "usingCA": entry.usingCA,
      "lte/nr": `lte`,
      "pci": utils.cleanSignal(entry.pci),
      "lte-ci/nr-nci": utils.cleanSignal(entry.ci),
      "lte-earfcn/nr-arfcn": arfcn,
      "band*": cellHelper.earfcnToBand(arfcn),
      "freq_mhz": cellHelper.earfcnToFreq(arfcn),
      "width_mhz": utils.cleanSignal(entry.width),
      "rsrp_dbm": utils.cleanSignal(entry.rsrp),
      "rsrq_db": utils.cleanSignal(entry.rsrq),
      "lte-rssi/nr-sinr_dbm": utils.cleanSignal(entry.rssi),
      "cqi": utils.cleanSignal(entry.cqi),
      "primary/other": (entry.width > 0 || entry.registered) ? "primary" : "other",
    };
  },

  psqlToCellJsonRedux: function (entry) {
    let arfcn = utils.cleanSignal(entry.earfcn);

    return {
      "latitude": entry.latitude,
      "longitude": entry.longitude,
      "operator": utils.getCleanOp(entry),
      "lte/nr": `lte`,
      "band*": cellHelper.earfcnToBand(arfcn),
      "rsrp_dbm": utils.cleanSignal(entry.rsrp),
    };
  },

  psqlToNrJson: function (entry) {
    // console.log(entry)
    let actualTimestamp = entry.timestampMs;
    if (actualTimestamp === null) {
      if (entry.timestampDeltaMs !== null) {
        actualTimestamp = entry.data_timestamp.getTime() - entry.timestampDeltaMs;
      } else {
        actualTimestamp = entry.data_timestamp.getTime();
      }
    }

    let arfcn = utils.cleanSignal(entry.nrarfcn);

    return {
      "timestamp": utils.printDateTime(actualTimestamp),
      "sigcap_version": entry.version,
      "android_version": entry.androidVersion,
      "is_debug": entry.isDebug,
      "uuid": entry.uuid,
      "device_name": entry.deviceName,
      "latitude": entry.latitude,
      "longitude": entry.longitude,
      "altitude": entry.altitude,
      "hor_acc": entry.hor_acc,
      "ver_acc": entry.ver_acc,
      "operator": utils.getCleanOp(entry),
      "network_type*": utils.getActiveNetwork(entry),
      "override_network_type": entry.overrideNetworkType,
      "radio_type": entry.phoneType,
      "nrStatus": entry.nrStatus,
      "nrAvailable": entry.nrAvailable,
      "dcNrRestricted": entry.dcNrRestricted,
      "enDcAvailable": entry.enDcAvailable,
      "nrFrequencyRange": entry.nrFrequencyRange,
      "cellBandwidths": `"${entry.cellBandwidths}"`,
      "usingCA": entry.usingCA,
      "lte/nr": `nr${entry.isSignalStrAPI ? "-SignalStrAPI" : ""}`,
      "pci": utils.cleanSignal(entry.pci),
      "lte-ci/nr-nci": utils.cleanSignal(entry.nci),
      "lte-earfcn/nr-arfcn": arfcn,
      "band*": cellHelper.nrarfcnToBand(arfcn, cellHelper.REGION.NAR),
      "freq_mhz": cellHelper.nrarfcnToFreq(arfcn),
      "width_mhz": "NaN",
      "rsrp_dbm": utils.cleanSignal(entry.ssRsrp),
      "rsrq_db": utils.cleanSignal(entry.ssRsrq),
      "lte-rssi/nr-sinr_dbm": utils.cleanSignal(entry.ssSinr),
      "cqi": "NaN",
      "primary/other": (entry.status === "primary") ? "primary" : "other",
    };
  },

  psqlToNrJsonRedux: function (entry) {
    // console.log(entry)
    let actualTimestamp = entry.timestampMs;
    if (actualTimestamp === null) {
      if (entry.timestampDeltaMs !== null) {
        actualTimestamp = entry.data_timestamp.getTime() - entry.timestampDeltaMs;
      } else {
        actualTimestamp = entry.data_timestamp.getTime();
      }
    }

    let arfcn = utils.cleanSignal(entry.nrarfcn);

    return {
      "latitude": entry.latitude,
      "longitude": entry.longitude,
      "operator": utils.getCleanOp(entry),
      "lte/nr": `nr${entry.isSignalStrAPI ? "-SignalStrAPI" : ""}`,
      "band*": cellHelper.nrarfcnToBand(arfcn, cellHelper.REGION.NAR),
      "rsrp_dbm": utils.cleanSignal(entry.ssRsrp),
    };
  },

  psqlToWifiJson: function (entry) {
    let actualTimestamp = entry.timestampMs;
    if (actualTimestamp === null) {
      if (entry.timestampDeltaMs !== null) {
        actualTimestamp = entry.data_timestamp.getTime() - entry.timestampDeltaMs;
      } else {
        actualTimestamp = entry.data_timestamp.getTime();
      }
    }
    let primaryFreq = utils.cleanSignal(entry.primaryFreq);
    let centerFreq0 = utils.cleanSignal(entry.centerFreq0);
    let centerFreq1 = utils.cleanSignal(entry.centerFreq1);
    let width = utils.cleanSignal(entry.width);

    return {
      "timestamp": utils.printDateTime(actualTimestamp),
      "sigcap_version": entry.version,
      "android_version": entry.androidVersion,
      "is_debug": entry.isDebug,
      "uuid": entry.uuid,
      "device_name": entry.deviceName,
      "latitude": entry.latitude,
      "longitude": entry.longitude,
      "altitude": entry.altitude,
      "hor_acc": entry.hor_acc,
      "ver_acc": entry.ver_acc,
      "operator": utils.getCleanOp(entry),
      "network_type*": utils.getActiveNetwork(entry),
      "usingCA": entry.usingCA,
      "ssid": entry.ssid ? `"${entry.ssid}"` : "",
      "bssid": entry.bssid,
      "primary_freq_mhz": primaryFreq,
      "center_freq_mhz": centerFreq1 ? centerFreq1 : centerFreq0,
      "width_mhz": width,
      "channel_num": wifiHelper.freqWidthToChannelNum(primaryFreq, width),
      "primary_ch_num": wifiHelper.freqWidthToChannelNum(primaryFreq, 20),
      "rssi_dbm": utils.cleanSignal(entry.rssi),
      "standard": entry.standard,
      "connected": entry.connected,
      "link_speed": utils.cleanSignal(entry.linkSpeed),
      "tx_link_speed": utils.cleanSignal(entry.txLinkSpeed),
      "rx_link_speed": utils.cleanSignal(entry.rxLinkSpeed),
      "max_supported_tx_link_speed": utils.cleanSignal(entry.maxSupportedTxLinkSpeed),
      "max_supported_rx_link_speed": utils.cleanSignal(entry.maxSupportedRxLinkSpeed),
      "capabilities": entry.capabilities,
      "sta_count": (entry.staCount === -1) ? "NaN" : utils.cleanSignal(entry.staCount),
      "ch_util": (entry.chUtil === -1) ? "NaN" : utils.cleanSignal(entry.chUtil),
      "tx_power_dbm": utils.cleanSignal(entry.txPower),
      "link_margin_db": utils.cleanSignal(entry.linkMargin),
      "alphanumeric_ap_name": entry.apName ? entry.apName : "unknown",
    }
  },

  cellularEntry: function (entry, mode = "any") {
    const outputArr = [];
    const entryTable = []; // Keep track of distinct entries

    overview = {
      "sigcap_version": entry.version,
      "android_version": entry.androidVersion,
      "is_debug": entry.isDebug,
      "uuid": entry.uuid,
      "device_name": entry.deviceName,
      "latitude": entry.location.latitude,
      "longitude": entry.location.longitude,
      "altitude": entry.location.altitude,
      "hor_acc": entry.location.hor_acc,
      "ver_acc": entry.location.ver_acc,
      "operator": utils.getCleanOp(entry),
      "network_type*": utils.getActiveNetwork(entry),
      "override_network_type": entry.overrideNetworkType,
      "radio_type": entry.phoneType,
      "nrStatus": entry.nrStatus,
      "nrAvailable": entry.nrAvailable,
      "dcNrRestricted": entry.dcNrRestricted,
      "enDcAvailable": entry.enDcAvailable,
      "nrFrequencyRange": entry.nrFrequencyRange,
      "cellBandwidths": `"${entry.cellBandwidths}"`,
      "usingCA": entry.usingCA,
    };
    timestamp = new Date(utils.getCleanDatetime(entry)).getTime();

    // LTE
    if (mode === "any" || mode === "lte") {
      // Populate single data point with NaNs if there are no entries
      if (entry.cell_info.length === 0) {
        const tempOut = {
          "timestamp": utils.printDateTime(timestamp)
        };
        for (let key in overview) {
          tempOut[key] = overview[key];
        }
        tempOut["lte/nr"] = "lte";
        tempOut["pci"] = "NaN";
        tempOut["lte-ci/nr-nci"] = "NaN";
        tempOut["lte-earfcn/nr-arfcn"] = "NaN";
        tempOut["band*"] = "N/A";
        tempOut["freq_mhz*"] = "NaN";
        tempOut["width_mhz"] = "NaN";
        tempOut["rsrp_dbm"] = "NaN";
        tempOut["rsrq_db"] = "NaN";
        tempOut["lte-rssi/nr-sinr_dbm"] = "NaN";
        tempOut["cqi"] = "NaN";
        tempOut["primary/other*"] = "other";
        outputArr.push(tempOut);
      }

      for (let cellEntry of entry.cell_info) {
        // Get the actual timestamp
        let actualTimestamp = cellEntry.timestampMs;
        if (actualTimestamp === undefined) {
          if (cellEntry.timestampDeltaMs !== undefined) {
            actualTimestamp = timestamp - cellEntry.timestampDeltaMs;
          } else {
            actualTimestamp = timestamp;
          }
        }

        // Skip entry with the same timestamp, pci, and earfcn
        let identifier = `lte${cellEntry.pci}${cellEntry.earfcn}${actualTimestamp}`;
        if (entryTable.includes(identifier)) {
          continue;
        }
        entryTable.push(identifier);

        let isPrimary = (cellEntry.width > 0 || cellEntry.registered);

        // Populate single data point
        const tempOut = {
          "timestamp": utils.printDateTime(actualTimestamp)
        };
        for (let key in overview) {
          tempOut[key] = overview[key];
        }
        tempOut["lte/nr"] = "lte";
        tempOut["pci"] = utils.cleanSignal(cellEntry.pci);
        tempOut["lte-ci/nr-nci"] = utils.cleanSignal(cellEntry.ci);
        tempOut["lte-earfcn/nr-arfcn"] = utils.cleanSignal(cellEntry.earfcn);
        tempOut["band*"] = cellHelper.earfcnToBand(tempOut["lte-earfcn/nr-arfcn"]);
        tempOut["freq_mhz*"] = cellHelper.earfcnToFreq(tempOut["lte-earfcn/nr-arfcn"]);
        tempOut["width_mhz"] = utils.cleanSignal(cellEntry.width);
        tempOut["rsrp_dbm"] = utils.cleanSignal(cellEntry.rsrp);
        tempOut["rsrq_db"] = utils.cleanSignal(cellEntry.rsrq);
        tempOut["lte-rssi/nr-sinr_dbm"] = utils.cleanSignal(cellEntry.rssi);
        tempOut["cqi"] = utils.cleanSignal(cellEntry.cqi);
        tempOut["primary/other*"] = isPrimary ? "primary" : "other";
        outputArr.push(tempOut);
      }
    }

    // Handle missing nr_info on older files
    if (entry.nr_info === undefined) {
      entry.nr_info = [];
    }

    // NR
    if (mode === "any" || mode === "nr") {
      // Populate single data point with NaNs if there are no entries
      if (entry.nr_info.length === 0) {
        const tempOut = {
          "timestamp": utils.printDateTime(timestamp)
        };
        for (let key in overview) {
          tempOut[key] = overview[key];
        }
        tempOut["lte/nr"] = "nr";
        tempOut["pci"] = "NaN";
        tempOut["lte-ci/nr-nci"] = "NaN";
        tempOut["lte-earfcn/nr-arfcn"] = "NaN";
        tempOut["band*"] = "N/A";
        tempOut["freq_mhz*"] = "NaN";
        tempOut["width_mhz"] = "NaN";
        tempOut["rsrp_dbm"] = "NaN";
        tempOut["rsrq_db"] = "NaN";
        tempOut["lte-rssi/nr-sinr_dbm"] = "NaN";
        tempOut["cqi"] = "NaN";
        tempOut["primary/other*"] = "other";
        outputArr.push(tempOut);
      }

      for (let cellEntry of entry.nr_info) {
        // Get the actual timestamp
        let actualTimestamp = cellEntry.timestampMs;
        if (actualTimestamp === undefined) {
          if (cellEntry.timestampDeltaMs !== undefined) {
            actualTimestamp = timestamp - cellEntry.timestampDeltaMs;
          } else {
            actualTimestamp = timestamp;
          }
        }

        // Skip entry with the same timestamp, pci, and nrarfcn
        let identifier = `nr${cellEntry.nrPci}${cellEntry.nrarfcn}${actualTimestamp}`;
        if (entryTable.includes(identifier)) {
          continue;
        }
        entryTable.push(identifier);

        let isPrimary = (cellEntry.isSignalStrAPI === false && cellEntry.status === "primary");

        // Populate single data point
        const tempOut = {
          "timestamp": utils.printDateTime(actualTimestamp)
        };
        for (let key in overview) {
          tempOut[key] = overview[key];
        }
        tempOut["lte/nr"] = cellEntry.isSignalStrAPI ? "nr-SignalStrAPI" : "nr";
        tempOut["pci"] = utils.cleanSignal(cellEntry.nrPci);
        tempOut["lte-ci/nr-nci"] = utils.cleanSignal(cellEntry.nci);
        tempOut["lte-earfcn/nr-arfcn"] = utils.cleanSignal(cellEntry.nrarfcn);
        tempOut["band*"] = cellHelper.nrarfcnToBand(
          tempOut["lte-earfcn/nr-arfcn"],
          cellHelper.REGION.NAR);
        tempOut["freq_mhz*"] = cellHelper.nrarfcnToFreq(tempOut["lte-earfcn/nr-arfcn"]);
        tempOut["width_mhz"] = "NaN";
        tempOut["rsrp_dbm"] = utils.cleanSignal(cellEntry.ssRsrp);
        tempOut["rsrq_db"] = utils.cleanSignal(cellEntry.ssRsrq);
        tempOut["lte-rssi/nr-sinr_dbm"] = utils.cleanSignal(cellEntry.ssSinr);
        tempOut["cqi"] = "NaN";
        tempOut["primary/other*"] = isPrimary ? "primary" : "other";
        outputArr.push(tempOut);
      }
    }

    return outputArr;
  },

  cellularJson: function(sigcapJson, mode) {
    // console.log(sigcapJson)
    outputArr = [];

    for (let entry of sigcapJson) {
      // console.log(entry)
       outputArr = outputArr.concat(this.cellularEntry(entry, mode));
    }

    return outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp));
  },

  wifiEntry: function (entry) {
    const outputArr = [];
    const entryTable = []; // Keep track of distinct entries

    overview = {
      "sigcap_version": entry.version,
      "android_version": entry.androidVersion,
      "is_debug": entry.isDebug,
      "uuid": entry.uuid,
      "device_name": entry.deviceName,
      "latitude": entry.location.latitude,
      "longitude": entry.location.longitude,
      "altitude": entry.location.altitude,
      "hor_acc": entry.location.hor_acc,
      "ver_acc": entry.location.ver_acc,
      "network_type*": utils.getActiveNetwork(entry),
    };
    timestamp = new Date(utils.getCleanDatetime(entry)).getTime();

    if (entry.wifi_info.length === 0) {
      // Populate single data point with NaNs
      const tempOut = {
        "timestamp": utils.printDateTime(timestamp)
      };
      for (let key in overview) {
        tempOut[key] = overview[key];
      }
      tempOut["ssid"] = "";
      tempOut["bssid"] = "unknown";
      tempOut["primary_freq_mhz"] = "NaN";
      tempOut["center_freq_mhz"] = "NaN";
      tempOut["width_mhz"] = "NaN";
      tempOut["channel_num"] = "NaN";
      tempOut["primary_ch_num"] = "NaN";
      tempOut["rssi_dbm"] = "NaN";
      tempOut["standard"] = "unknown";
      tempOut["connected"] = false;
      tempOut["link_speed"] = "NaN";
      tempOut["tx_link_speed"] = "NaN";
      tempOut["rx_link_speed"] = "NaN";
      tempOut["max_supported_tx_link_speed"] = "NaN";
      tempOut["max_supported_rx_link_speed"] = "NaN";
      tempOut["capabilities"] = "NaN";
      tempOut["sta_count"] = "NaN";
      tempOut["ch_util"] = "NaN";
      tempOut["tx_power_dbm"] = "NaN";
      tempOut["link_margin_db"] = "NaN";
      tempOut["alphanumeric_ap_name"] = "unknown";
      tempOut["6ghz_type"] = "unknown";
    }

    for (let wifiEntry of entry.wifi_info) {
      // Get the actual timestamp
      let actualTimestamp = wifiEntry.timestampMs;
      if (actualTimestamp === undefined) {
        if (wifiEntry.timestampDeltaMs !== undefined) {
          actualTimestamp = timestamp - wifiEntry.timestampDeltaMs;
        } else {
          actualTimestamp = timestamp;
        }
      }

      // Skip entry with the same timestamp and bssid
      let identifier = `${wifiEntry.bssid}${actualTimestamp}`;
      if (entryTable.includes(identifier)) {
        continue;
      }
      entryTable.push(identifier);

      // Populate single data point
      const tempOut = {
        "timestamp": utils.printDateTime(actualTimestamp)
      };
      for (let key in overview) {
        tempOut[key] = overview[key];
      }
      tempOut["ssid"] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : "";
      tempOut["bssid"] = wifiEntry.bssid;
      tempOut["primary_freq_mhz"] = wifiEntry.primaryFreq;
      tempOut["center_freq_mhz"] = (wifiEntry.centerFreq1 === 0) ? wifiEntry.centerFreq0 : wifiEntry.centerFreq1;
      tempOut["width_mhz"] = wifiEntry.width
      tempOut["channel_num"] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, wifiEntry.width);
      tempOut["primary_ch_num"] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20);
      tempOut["rssi_dbm"] = utils.cleanSignal(
          wifiEntry.rssi);
      tempOut["standard"] = wifiEntry.standard;
      tempOut["connected"] = wifiEntry.connected;
      if (tempOut["connected"] === true) {
        tempOut["link_speed"] = utils.cleanSignal(
            wifiEntry.linkSpeed);
        tempOut["tx_link_speed"] = utils.cleanSignal(
            wifiEntry.txLinkSpeed);
        tempOut["rx_link_speed"] = utils.cleanSignal(
            wifiEntry.rxLinkSpeed);
        tempOut["max_supported_tx_link_speed"] = utils.cleanSignal(
            wifiEntry.maxSupportedTxLinkSpeed);
        tempOut["max_supported_rx_link_speed"] = utils.cleanSignal(
            wifiEntry.maxSupportedRxLinkSpeed);
      } else {
        tempOut["link_speed"] = "NaN";
        tempOut["tx_link_speed"] = "NaN";
        tempOut["rx_link_speed"] = "NaN";
        tempOut["max_supported_tx_link_speed"] = "NaN";
        tempOut["max_supported_rx_link_speed"] = "NaN";
      }
      tempOut["capabilities"] = wifiEntry.capabilities;
      tempOut["sta_count"] = utils.cleanSignal(wifiEntry.staCount);
      if (tempOut["sta_count"] == -1) {
        tempOut["sta_count"] = "NaN";
      }
      tempOut["ch_util"] = utils.cleanSignal(wifiEntry.chUtil);
      if (tempOut["ch_util"] == -1) {
        tempOut["ch_util"] = "NaN";
      }
      tempOut["tx_power_dbm"] = utils.cleanSignal(wifiEntry.txPower);
      tempOut["link_margin_db"] = utils.cleanSignal(wifiEntry.linkMargin);
      tempOut["alphanumeric_ap_name"] = wifiEntry.apName ? wifiEntry.apName : "unknown";
      tempOut["6ghz_ap_type"] = wifiHelper.get6GhzApType(wifiEntry);

      outputArr.push(tempOut);
    }

    return outputArr;
  },

  wifiJson: function(sigcapJson) {
    outputArr = []

    for (let entry of sigcapJson) {
      // console.log(entry)
       outputArr = outputArr.concat(this.wifiEntry(entry));
    }

    return outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp));
  },
}

module.exports = csv
