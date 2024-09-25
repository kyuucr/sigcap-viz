const math = require("mathjs");
const csv = require("./csv");
const utils = require("./utils");
const wifiHelper = require("./wifi-helper");


const statFnDict = {
  "max": (arr) => {
    if (arr.length === 1 && arr[0] === "NaN") {
      return "NaN";
    } else {
      return math.max(arr);
    }
  },
  "mean": (arr) => {
    if (arr.length === 1 && arr[0] === "NaN") {
      return "NaN";
    } else {
      const arrMw = arr.map(val => utils.dbmToMw(val));
      return utils.mwToDbm(math.mean(arrMw));
    }
  }
};


function zoomToBinRadius (zoomLevel, latitude) {
  const earthRadiusMeters = 6378137; // Earth's radius in meters
  const metersPerPixel = (Math.cos(latitude * Math.PI / 180) * 2 * Math.PI * earthRadiusMeters) / (256 * Math.pow(2, zoomLevel));
  return metersPerPixel;
}

function getRgbaFromWeight (weight) {
  // console.log(weight)
  const gradientBase = [
    [ 163,   0,  0, 1 ],
    [ 255, 255,  0, 1 ],
    [  56, 200, 56, 1 ],
  ];

  let idx = Math.floor(weight * (gradientBase.length - 1));
  // sanity check
  if (idx >= gradientBase.length - 1) {
    idx = gradientBase.length - 2;
  }
  let weightRel = weight * (gradientBase.length - 1) - idx;
  let red = (gradientBase[idx + 1][0] - gradientBase[idx][0]) * weightRel + gradientBase[idx][0];
  let grn = (gradientBase[idx + 1][1] - gradientBase[idx][1]) * weightRel + gradientBase[idx][1];
  let blu = (gradientBase[idx + 1][2] - gradientBase[idx][2]) * weightRel + gradientBase[idx][2];

  return `rgba(${red},${grn},${blu},1)`;
}

function getWeightRsrp (input) {
  return getWeight(input, -140, 80);
}

function getWeightRssi (input) {
  return getWeight(input, -90, 40);
}

function getWeight (input, min, range) {
  // console.log(input)
  let result = (input - min) / range;
  if (result > 1) {
    result = 1;
  } else if (result < 0) {
    result = 0;
  }
  return result;
}

function processSignal (inputArr, signalIdx, step, filterFn, statFn, weightFn) {
  const processedArr = inputArr.map(val => {
    // Give the actual signal value if it pass the filters
    let signal = "NaN";
    if (typeof val[signalIdx] === "number"
        && filterFn(val)) {
      signal = val[signalIdx];
    }
    // console.log(signal, typeof signal)
    // Map to latitude and longitude bin, and RSRP
    return {
      latBin: math.floor(val.latitude / step) * step,
      lngBin: math.floor(val.longitude / step) * step,
      signalArr: [ signal ],
      count: signal === "NaN" ? 0 : 1
    };
  }).reduce((prev, curr) => {
    // Group by latitude and longitude bin, gather signals
    let idx = prev.findIndex(val => val.latBin === curr.latBin && val.lngBin === curr.lngBin)
    if (idx === -1) {
      prev.push(curr);
    } else if (curr.signalArr[0] !== "NaN") {
      // if (prev[idx].count === 0 || prev[idx].signal < curr.signal) {
      if (prev[idx].count === 0) {
        prev[idx].signalArr = curr.signalArr;
      } else {
        prev[idx].signalArr.push(curr.signalArr[0]);
      }
      prev[idx].count += 1;
    }
    return prev;
  }, [])
  .map(val => {
    return {
      latBin: val.latBin,
      lngBin: val.lngBin,
      signal: statFn(val.signalArr),
      count: val.count,
    }
  });

  return geojson = {
    type: "FeatureCollection",
    features: processedArr.map(val => {
      let lat0 = val.latBin;
      let lng0 = val.lngBin;
      let lat1 = val.latBin + step;
      let lng1 = val.lngBin + step;
      return {
        type: "Feature",
        properties: {
          color: val.signal === "NaN" ? "#808080" : getRgbaFromWeight(weightFn(val.signal)),
          signal: val.signal,
          count: val.count
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [ lng0, lat0 ],
              [ lng1, lat0 ],
              [ lng1, lat1 ],
              [ lng0, lat1 ],
              [ lng0, lat0 ]
            ]
          ]
        }
      };
    })
  };
}


const mapping = {
  getBoundary: function (sigcapArr) {
    // [ minLat, maxLat, minLng, maxLng ]
    let boundary = sigcapArr.reduce((prev, curr) => {
      if (curr.location.latitude < prev[0]) {
        prev[0] = curr.location.latitude;
      }
      if (curr.location.latitude > prev[1]) {
        prev[1] = curr.location.latitude;
      }
      if (curr.location.longitude < prev[2]) {
        prev[2] = curr.location.longitude;
      }
      if (curr.location.longitude > prev[3]) {
        prev[3] = curr.location.longitude;
      }
      return prev;
    }, [ 999.9, -999.9, 999.9, -999.9 ]);

    return boundary;
  },

  cellular: function (cellularArr, options) {
    const zoomLevel = options.zoomLevel || 15;
    const tileSize = 20 * zoomToBinRadius(zoomLevel, cellularArr[0].latitude);
    const step = tileSize / 111.32e3;
    const bandFilter = options.bandFilter || "all";
    const statMode = options.statMode || "max";
    console.log(`zoomLevel= ${zoomLevel}, tileSize=${tileSize} m, step= ${step}, `
      + `bandFilter=${bandFilter}, statMode=${statMode}`);

    return processSignal(
      cellularArr,
      "rsrp_dbm",
      step,
      val => {
        return (bandFilter === "all" || val["band*"] == bandFilter);
      },
      statFnDict[statMode],
      getWeightRsrp
    );
  },

  wifi: function (wifiArr, options) {
    const zoomLevel = options.zoomLevel || 15;
    const tileSize = 20 * zoomToBinRadius(zoomLevel, wifiArr[0].latitude);
    const step = tileSize / 111.32e3;
    const wifiFreqFilter = options.wifiFreqFilter || "2.4";
    const uniiFilter = options.uniiFilter || "all";
    const statMode = options.statMode || "max";
    console.log(`zoomLevel= ${zoomLevel}, tileSize=${tileSize} m, step= ${step}, `
      + `wifiFreqFilter=${wifiFreqFilter}, uniiFilter=${uniiFilter}, statMode=${statMode}`);

    return processSignal(
      wifiArr,
      "rssi_dbm",
      step,
      val => {
        return (wifiFreqFilter === "all" || wifiHelper.getFreqCode(val["primary_freq_mhz"]) === wifiFreqFilter)
          && (uniiFilter === "all" || wifiHelper.getUniiCode(val["primary_freq_mhz"]) === uniiFilter);
      },
      statFnDict[statMode],
      getWeightRssi
    );
  }
};

module.exports = mapping;
