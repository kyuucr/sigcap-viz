///////////////////////////
// global vars
///////////////////////////

const plainMap = [
  {
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#f5f5f5"
    }
    ]
  },
  {
    "elementType": "labels",
    "stylers": [
    {
      "visibility": "on"
    }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#616161"
    }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
    {
      "color": "#f5f5f5"
    }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#bdbdbd"
    }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#eeeeee"
    }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#757575"
    }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#e5e5e5"
    }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#9e9e9e"
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#ffffff"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#757575"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#dadada"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#616161"
    }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#9e9e9e"
    }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#e5e5e5"
    }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#eeeeee"
    }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
    {
      "color": "#c9c9c9"
    }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#9e9e9e"
    }
    ]
  }
];
let currentRectangle = null; // Variable to store the current rectangle
let map = null;
let infoWindow = null;
let drawingManager = null;

const mapModal = new bootstrap.Modal(document.getElementById("mapModal"));
const spinnerModal = new bootstrap.Modal(document.getElementById("spinnerModal"));
const mlModal = new bootstrap.Modal(document.getElementById("mlModal"));
const selectedFiles = [];
let totalEntries = 0;
let mapMode = "selectCoord";
let opList = [];
let bandList = {};
let selectedTech = "lte";
let selectedWifiFreq = "2.4";
let selectedStatMode = "max";
const uniiList = {
  "2.4": [ "all" ],
  "5": [ "all", "U-NII-1", "U-NII-2A", "U-NII-2C", "U-NII-3", "U-NII-4" ],
  "6": [ "all", "U-NII-5", "U-NII-6", "U-NII-7", "U-NII-8" ],
}
let spinnerHiddenCb = null;
let spinnerNeedHide = false;


///////////////////////////
// function definitions
///////////////////////////


function showSpinner (show, cb) {
  console.log(`showSpinner= ${show}`);
  if (show) {
    spinnerHiddenCb = null;
    spinnerModal.show();
  } else {
    spinnerNeedHide = true;
    if (cb) {
      spinnerHiddenCb = cb;
    }
    // Attempt to hide, will not work if the modal is not finished showing.
    spinnerModal.hide();
  }
}

function downloadBlob(blob, name) {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}

function checkAll() {
  if (selectedFiles.length == totalEntries) {
    // Uncheck all
    document.querySelectorAll(`input[type=checkbox][name=files]`).forEach(dom => {
      dom.checked = false
      selectedFiles.length = 0
    })
  } else {
    // Check all
    document.querySelectorAll(`input[type=checkbox][name=files]`).forEach(dom => {
      dom.checked = true
      if (!selectedFiles.includes(dom.value)) {
        selectedFiles.push(dom.value)
      }
    })
  }
  console.log(`# of selectedFiles= ${selectedFiles.length}`)
}

function appendData(data) {
  console.log(`# of files= ${data.length}`)
  totalEntries = data.length
  let mainContainer = document.getElementById("fileTable")

  // Initialize table and header checkbox
  mainContainer.innerHTML = "";
  document.getElementById("filesCheckAll").checked = false;
  document.getElementById("filesCheckAll").indeterminate = false;
  selectedFiles.length = 0;

  for (let entry of data) {
    // console.log(entry)
    let tr = document.createElement("tr")
    tr.innerHTML = `<td><input type="checkbox" class="form-check-input" id="${entry}" value="${entry}" name="files" >` +
      `<label class="form-check-label ms-1" for="${entry}">${entry}</label></td>`
    mainContainer.appendChild(tr)
  }

  // Set checkbox on click event
  document.querySelectorAll(`input[type=checkbox][name=files]`).forEach(dom => {
    dom.addEventListener(`change`, (event) => {
      // Add or remove
      if (event.target.checked) {
        selectedFiles.push(event.target.value)
      } else {
        selectedFiles.splice(selectedFiles.indexOf(event.target.value), 1)
      }

      // Update filesCheckAll state
      let filesCheckAll = document.getElementById("filesCheckAll")
      if (selectedFiles.length == 0) {
        filesCheckAll.indeterminate = false
        filesCheckAll.checked = false
      } else if (selectedFiles.length == totalEntries) {
        filesCheckAll.indeterminate = false
        filesCheckAll.checked = true
      } else {
        filesCheckAll.checked = false
        filesCheckAll.indeterminate = true
      }
      console.log(`# of selectedFiles= ${selectedFiles.length}`)
    })
  })
}

function fetchFileList(extras) {
  showSpinner(true);
  fetch("/files", extras)
    .then(function (response) {
      if (response.status !== 200) {
        return response.text().then(errText => {
          throw new Error(errText)
        })
      }
      return response.json()
    })
    .then(function (data) {
      showSpinner(false, () => {
        appendData(data);
      });
    })
    .catch(function (err) {
      showSpinner(false, () => {
        console.error(err);
        window.alert(err);
      });
    })
}

function submitFilter() {
  let filter = document.getElementById("inputFilter")
  console.log(`Filter= ${filter.value}`)
  fetchFileList({
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: "filter", params: filter.value })
  })
}

function clearFilter() {
  document.getElementById("inputFilter").value = ""
  fetchFileList()
}

function getFilterObj(){
  let startGps = document.getElementById("inputGpsStart").value
  let endGps = document.getElementById("inputGpsEnd").value
  let startDt = document.getElementById("inputDtStart").value
  let endDt = document.getElementById("inputDtEnd").value
  let zoneDt = document.getElementById("inputDtZone").value

  let filterObj = {}
  if (selectedFiles.length > 0) {
    filterObj.files = selectedFiles;
  }
  if (startGps !== "" && endGps !== "") {
    filterObj.gps = {
      start: startGps,
      end: endGps
    };
  }
  if (startDt !== "" && endDt !== "" && zoneDt !== "") {
    let startTimestamp = new Date(startDt);
    let endTimestamp = new Date(endDt);
    let startOffset = startTimestamp.getTimezoneOffset();
    let endOffset = endTimestamp.getTimezoneOffset();
    filterObj.timestamp = {
      start: new Date(startTimestamp.getTime() - (startOffset * 60 * 1000)).toISOString().slice(0, -1) + zoneDt,
      end: new Date(endTimestamp.getTime() - (endOffset * 60 * 1000)).toISOString().slice(0, -1) + zoneDt
    };
  }

  return filterObj;
}

function fetchFiles(mode, filterObj = null) {
  if (filterObj === null) {
    filterObj = getFilterObj();
  }
  if (Object.keys(filterObj).length === 0) {
    window.alert("Please make at least one selection: GPS coordinates, date range, or files.");
    return false;
  }

  showSpinner(true);
  fetch("/files", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: mode, params: filterObj})
  })
  .then(function (response) {
    if (response.status !== 200) {
      return response.text().then(errText => {
        throw new Error(errText)
      })
    }
    return response.blob()
  })
  .then(function (data) {
    showSpinner(false, () => {
      console.log(data);
      downloadBlob(data, mode === "json" ? "raw.json" : `${mode}.csv`);
    });
  })
  .catch(function (err) {
    showSpinner(false, () => {
      console.error(err);
      window.alert(err);
    });
  })

  return false;
}

function fetchGeoJson (extraFilters) {
  let filterObj = getFilterObj();
  filterObj.zoomLevel = map.getZoom();
  for (let key in extraFilters) {
    filterObj[key] = extraFilters[key];
  }

  showSpinner(true);
  return fetch("/files", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: `${mapMode}Map`, params: filterObj})
  }).then(result => {
    showSpinner(false);
    return result.json();
  }).catch(err => {
    showSpinner(false, () => {
      console.error(err);
      window.alert(err);
    });
  });
}

function submitMapFilterCell () {
  fetchGeoJson({
    bandFilter: document.getElementById("bandSelect").value,
    techFilter: selectedTech,
    opFilter: document.getElementById("opSelect").value,
    statMode: selectedStatMode,
  })
  .then(data => {
    fillHeatmap(data);
  });
}

function submitMapFilterWifi () {
  fetchGeoJson({
    uniiFilter: document.getElementById("uniiSelect").value,
    wifiFreqFilter: selectedWifiFreq,
    statMode: selectedStatMode,
  })
  .then(data => {
    fillHeatmap(data);
  });
}

function showMap (mode) {
  let filterObj = getFilterObj();
  if (mode !== "selectCoord"
      && Object.keys(filterObj).length === 0) {
    window.alert("Please make at least one selection: GPS coordinates, date range, or files.");
    return false;
  }

  mapMode = mode;
  mapModal.show();
}

function fillHeatmap (geojson) {
  // Remove prior data
  if (currentRectangle) {
    currentRectangle.setMap(null);
  }
  map.data.forEach(feature => {
    map.data.remove(feature);
  });

  // Add current data
  map.data.addGeoJson(geojson);
}

function initBandList () {
  const op = document.getElementById("opSelect").value;
  const mainContainer = document.getElementById("bandSelect");
  mainContainer.innerHTML = "";

  let first = true;
  let allBands = [ "all" ].concat(bandList[op][selectedTech]);
  for (let band of allBands) {
    let option = document.createElement("option");
    option.innerHTML = `<option${first ? " selected" : ""} value="${band}">${band}</option>`;
    mainContainer.appendChild(option);
    first = false;
  }
}

function initOpList () {
  const mainContainer = document.getElementById("opSelect");
  mainContainer.innerHTML = "";

  let first = true;
  for (let op of opList) {
    let option = document.createElement("option");
    option.innerHTML = `<option${first ? " selected" : ""} value="${op}">${op}</option>`;
    mainContainer.appendChild(option);
    first = false;
  }
}

function initUniiList () {
  const mainContainer = document.getElementById("uniiSelect");
  mainContainer.innerHTML = "";

  let first = true;
  let allBands = uniiList[selectedWifiFreq];
  for (let unii of allBands) {
    let option = document.createElement("option");
    option.innerHTML = `<option${first ? " selected" : ""} value="${unii}">${unii}</option>`;
    mainContainer.appendChild(option);
    first = false;
  }
}

function showMlOptions() {
  let filterObj = getFilterObj();
  if (Object.keys(filterObj).length === 0) {
    window.alert("Please make at least one selection: GPS coordinates, date range, or files.");
    return false;
  }

  mlModal.show();
}

function submitMlOptions() {
  mlModal.hide();
  let filterObj = getFilterObj();
  if (Object.keys(filterObj).length === 0) {
    window.alert("Please make at least one selection: GPS coordinates, date range, or files.");
    return false;
  }
  filterObj.intervalSec = parseInt(document.getElementById("mlOptionAggIntervalInput").value);
  filterObj.aggMethod = document.getElementById("mlOptionAggMethodSelect").value;
  fetchFiles("ml", filterObj);
}

function updateFbase() {
  showSpinner(true);
  fetch("/files", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: `update` })
  })
  .then(result => {
    return result.text();
  })
  .then(data => {
    showSpinner(false, () => {
      console.log(data);
      window.alert(data);
      location.reload();
    });
  })
  .catch(err => {
    showSpinner(false, () => {
      console.error(err)
      window.alert(err)
    });
  })
}


////////////////////////
// GMap APIs
////////////////////////
function initMap() {
  // let chiCenter = { lat: 41.877504, lng: -87.631403 }
  let ndCenter = { lat: 41.69849558373332, lng: -86.23473923357669 }
  map = new google.maps.Map(document.getElementById("heatmap"), {zoom: 12, center: ndCenter});
  // let transitLayer = new google.maps.TransitLayer();
  // transitLayer.setMap(map);
  map.set('styles', plainMap);

  map.data.setStyle(feature => {
    return {
      strokeWeight: 0,
      fillOpacity: 0.5,
      fillColor: feature.getProperty("color")
    }
  });

  infoWindow = new google.maps.InfoWindow();
  map.data.addListener("click", (event) => {
    infoWindow.setContent(
      `${mapMode === "cellular" ? "RSRP" : "RSSI"}: `
        + `${event.feature.getProperty("signal").toFixed(2)} dBm<br>`
        + `Count: ${event.feature.getProperty("count")}`);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE, // Set drawing mode to rectangle
    drawingControl: true, // Show drawing controls on the map
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
      // Limit to rectangle
    }
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
    // Remove the previous rectangle if it exists
    if (currentRectangle) {
      currentRectangle.setMap(null);
    }

    currentRectangle = rectangle; // Update the current rectangle

    const bounds = rectangle.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    console.log('Bounding Coordinates:');
    console.log('Southwest:', sw.lat(), sw.lng());
    let startGps = `${sw.lat()}, ${sw.lng()}`;
    document.getElementById("inputGpsStart").value = startGps;
    document.getElementById("previewGpsStart").value = startGps;
    console.log('Northeast:', ne.lat(), ne.lng());
    let endGps = `${ne.lat()}, ${ne.lng()}`;
    document.getElementById("inputGpsEnd").value = endGps;
    document.getElementById("previewGpsEnd").value = endGps;
    console.log("bound zoom level= " + getZoomByBounds(map, bounds));
  });
}

function getZoomByBounds (map, bounds) {
  let mapType = map.mapTypes.get(map.getMapTypeId());
  let MAX_ZOOM = mapType ? mapType.maxZoom : 22;
  let MIN_ZOOM = mapType ? mapType.minZoom : 0;

  let ne = map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
  let sw = map.getProjection().fromLatLngToPoint(bounds.getSouthWest());

  let worldCoordWidth = Math.abs(ne.x - sw.x);
  let worldCoordHeight = Math.abs(ne.y - sw.y);

  //Fit padding in pixels
  let FIT_PAD = 40;
  let width = map.getDiv().offsetWidth;
  let height = map.getDiv().offsetHeight;

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; --zoom) {
      if (worldCoordWidth * (1 << zoom) + 2 * FIT_PAD < width
          && worldCoordHeight * (1 << zoom) + 2 * FIT_PAD < height)
        return zoom;
  }
  return 0;
}


////////////////////////
// Initializations
////////////////////////

// Init selector on map modal
document.getElementById(`techSelect`).addEventListener(
  `change`, event => {
    selectedTech = event.target.value;
    console.log(`selectedTech= ${event.target.value}`)
    initBandList();
  }
);
document.getElementById(`opSelect`).addEventListener(
  `change`, event => {
    console.log(`selectedOp= ${event.target.value}`)
    initBandList();
  }
);
document.getElementById(`wifiFreqSelect`).addEventListener(
  `change`, event => {
    selectedWifiFreq = event.target.value;
    console.log(`selectedWifiFreq= ${event.target.value}`)
    initUniiList();
  }
);
document.getElementById(`statSelectCell`).addEventListener(
  `change`, event => {
    selectedStatMode = event.target.value;
    console.log(`selectedStatMode= ${event.target.value}`)
  }
);
document.getElementById(`statSelectWifi`).addEventListener(
  `change`, event => {
    selectedStatMode = event.target.value;
    console.log(`selectedStatMode= ${event.target.value}`)
  }
);

// Init map modal
document.getElementById("mapModal").addEventListener('shown.bs.modal', () => {
  if (mapMode === "selectCoord") {
    document.getElementById("coordBox").style.display = '';
    document.getElementById("vizBoxCell").style.display = 'none';
    document.getElementById("vizBoxWifi").style.display = 'none';
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    // drawingManager.drawingControl = true;
    map.data.forEach(feature => {
      map.data.remove(feature);
    });
  } else if (mapMode === "cellular") {
    document.getElementById("coordBox").style.display = 'none';
    document.getElementById("vizBoxCell").style.display = '';
    document.getElementById("vizBoxWifi").style.display = 'none';
    document.getElementById("techRadioLte").checked = true;
    document.getElementById("statRadioCellMax").checked = true;
    selectedTech = "lte";
    selectedStatMode = "max";
    drawingManager.setDrawingMode(null);
    // drawingManager.drawingControl = false;

    let filterObj = getFilterObj();
    fetch("/files", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command: `metaMap`, params: filterObj})
    })
    .then(function (response) {
      if (response.status !== 200) {
        return response.text().then(errText => {
          throw new Error(errText);
        })
      }
      return response.json();
    })
    .then(function (data) {
      console.log("map metadata= ", data)
      let [ swLat, neLat, swLng, neLng ] = data.boundary;
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(swLat, swLng),
        new google.maps.LatLng(neLat, neLng)
      );
      let zoomLevel = getZoomByBounds(map, bounds);
      map.setZoom(zoomLevel);
      map.fitBounds(bounds);

      bandList = data.bandList;
      opList = data.opList;
      selectedTech = "lte";
      selectedStatMode = "max";
      initOpList();
      initBandList();

      return fetchGeoJson({
        bandFilter: "all",
        techFilter: "lte",
        opFilter: opList[0],
        statMode: "max"
      });
    })
    .then(function (data) {
      console.log(data);
      fillHeatmap(data);
    })
    .catch(function (err) {
      console.error(err);
      window.alert(err);
    });

  } else if (mapMode === "wifi") {
    document.getElementById("coordBox").style.display = 'none';
    document.getElementById("vizBoxCell").style.display = 'none';
    document.getElementById("vizBoxWifi").style.display = '';
    document.getElementById("wifiFreqRadio2_4").checked = true;
    document.getElementById("statRadioWifiMax").checked = true;
    selectedWifiFreq = "2.4";
    selectedStatMode = "max";
    drawingManager.setDrawingMode(null);
    // drawingManager.drawingControl = false;

    let filterObj = getFilterObj();
    fetch("/files", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command: `metaMap`, params: filterObj})
    })
    .then(function (response) {
      if (response.status !== 200) {
        return response.text().then(errText => {
          throw new Error(errText);
        })
      }
      return response.json();
    })
    .then(function (data) {
      console.log("map metadata= ", data)
      let [ swLat, neLat, swLng, neLng ] = data.boundary;
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(swLat, swLng),
        new google.maps.LatLng(neLat, neLng)
      );
      let zoomLevel = getZoomByBounds(map, bounds);
      map.setZoom(zoomLevel);
      map.fitBounds(bounds);

      selectedWifiFreq = "2.4";
      selectedStatMode = "max";
      initUniiList();

      return fetchGeoJson({
        uniiFilter: "all",
        wifiFreqFilter: "2.4",
        statMode: "max"
      });
    })
    .then(function (data) {
      console.log(data);
      fillHeatmap(data);
    })
    .catch(function (err) {
      console.error(err);
      window.alert(err);
    });

  }
});

document.getElementById("spinnerModal").addEventListener('hidden.bs.modal', () => {
  console.log(`Spinner hidden ! cb= ${spinnerHiddenCb}`);
  spinnerNeedHide = false;
  if (spinnerHiddenCb) {
    spinnerHiddenCb();
    spinnerHiddenCb = null;
  }
});

document.getElementById("spinnerModal").addEventListener('shown.bs.modal', () => {
  if (spinnerNeedHide) {
    spinnerModal.hide()
  }
});

// Init date time picker
const dtOptions = {
  display: {
    icons: {
      type: "icons",
      time: "bi bi-clock",
      date: "bi bi-calendar-week",
      up: "bi bi-arrow-up",
      down: "bi bi-arrow-down",
      previous: "bi bi-chevron-left",
      next: "bi bi-chevron-right",
      today: "bi bi-calendar-check",
      clear: "bi bi-trash",
      close: "bi bi-x"
    },
    buttons: {
      clear: true
    },
    theme: "light"
  }
}
const dtPickerStart = new tempusDominus.TempusDominus(document.getElementById("inputDtStart"), dtOptions)
const dtPickerEnd = new tempusDominus.TempusDominus(document.getElementById("inputDtEnd"), dtOptions)
const localOffset = new Date().getTimezoneOffset()
document.getElementById("inputDtZone").value =
  `${localOffset > 0 ? "-" : "+"}`
    + `${('00' + Math.abs(localOffset / 60)).slice(-2)}`
    + `${('00' + Math.abs(localOffset % 60)).slice(-2)}`

// Fetch all files
fetchFileList()
