const math = require("mathjs");
const csv = require("./csv");


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
    console.log(`zoomLevel= ${zoomLevel}, tileSize=${tileSize} m, step= ${step}, `
      + `bandFilter=${bandFilter}`);


    const cellArr = cellularArr.map(val => {
      // Give the actual RSRP if it pass the filters
      let rsrp = "NaN";
      if (bandFilter === "all" || val["band*"] == bandFilter) {
        rsrp = val["rsrp_dbm"];
      }
      // console.log(rsrp, typeof rsrp)
      // Map to latitude and longitude bin, and RSRP
      return {
        latBin: math.floor(val.latitude / step) * step,
        lngBin: math.floor(val.longitude / step) * step,
        rsrp: rsrp,
        count: 1
      };
    }).reduce((prev, curr) => {
      // Group by latitude and longitude bin, find max RSRP
      let idx = prev.findIndex(val => val.latBin === curr.latBin && val.lngBin === curr.lngBin)
      if (idx === -1) {
        prev.push(curr);
      } else {
        prev[idx].count += 1;
        if (curr.rsrp && prev[idx].rsrp < curr.rsrp) {
          prev[idx].rsrp = curr.rsrp;
        }
      }
      return prev;
    }, []);

    let geojson = {
        type: "FeatureCollection",
        features: cellArr.map(val => {
          let lat0 = val.latBin;
          let lng0 = val.lngBin;
          let lat1 = val.latBin + step;
          let lng1 = val.lngBin + step;
          return {
            type: "Feature",
            properties: {
              color: val.rsrp === "NaN" ? "#808080" : getRgbaFromWeight(getWeightRsrp(val.rsrp)),
              rsrp: val.rsrp,
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

    return geojson;
  }
};

module.exports = mapping;
