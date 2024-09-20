const selectedFiles = []
let totalEntries = 0

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
  mainContainer.innerHTML = ""
  document.getElementById("filesCheckAll").checked = false

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
  fetch("/files", extras)
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      // console.log(data)
      appendData(data)
    })
    .catch(function (err) {
      console.log('error: ' + err)
      window.alert(`error: ${err}`)
    })
}

function filter() {
  let filter = document.getElementById("inputFilter")
  console.log(`Filter= ${filter.value}`)
  fetchFileList({
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({command: "filter", params: filter.value})
  })
}

function fetchFiles(mode) {
  if (selectedFiles.length === 0) {
    window.alert("Please select at least 1 file !")
    return
  }

  fetch("/files", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({command: mode, params: selectedFiles})
  }).then(function (response) {
      return response.blob()
    })
    .then(function (data) {
      // console.log(data)
      downloadBlob(data, mode === "json" ? "raw.json" : `${mode}.csv`);
    })
    .catch(function (err) {
      console.log('error: ' + err)
      window.alert(`error: ${err}`)
    })
}

const mapModal = new bootstrap.Modal(document.getElementById("mapModal"))

function showMap() {
  if (selectedFiles.length === 0) {
    window.alert("Please select at least 1 file !")
    return
  }

  mapModal.show()
}

function selectOnMap() {
  mapModal.show()
}

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
]

let currentRectangle = null; // Variable to store the current rectangle

function initMap() {
  // let chiCenter = { lat: 41.877504, lng: -87.631403 }
  let ndCenter = { lat: 41.69849558373332, lng: -86.23473923357669 }
  map = new google.maps.Map(document.getElementById("heatmap"), {zoom: 12, center: ndCenter});
  // let transitLayer = new google.maps.TransitLayer();
  // transitLayer.setMap(map);
  map.set('styles', plainMap);

  // infoWindow = new google.maps.InfoWindow();

  const drawingManager = new google.maps.drawing.DrawingManager({
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
    document.getElementById("inputGpsStart").value = `${sw.lat()}, ${sw.lng()}`
    document.getElementById("previewGpsStart").value = `${sw.lat()}, ${sw.lng()}`
    console.log('Northeast:', ne.lat(), ne.lng());
    document.getElementById("inputGpsEnd").value = `${ne.lat()}, ${ne.lng()}`
    document.getElementById("previewGpsEnd").value = `${ne.lat()}, ${ne.lng()}`
  });
}

fetchFileList()
