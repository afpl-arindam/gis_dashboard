
let bufferLayer = null;
let bufferCenter = null;

// Drawing Controls
const drawControl = new L.Control.Draw({

  position: "topright",

  draw: {

    polygon: {
      allowIntersection: false,
      shapeOptions: {
        color: "#2563eb"
      }
    },

    rectangle: {
      shapeOptions: {
        color: "#10b981"
      }
    },

    circle: {
      shapeOptions: {
        color: "#f59e0b"
      }
    },

    polyline: {
      shapeOptions: {
        color: "#ef4444"
      }
    },

    marker: true,

    circlemarker: false

  },

  edit: {
    featureGroup: drawnItems
  }

});

map.addControl(drawControl);

// Geometry Count
let geometryCount = 0;

// Draw Created
map.on(L.Draw.Event.CREATED, function (event) {

  const layer = event.layer;

  drawnItems.addLayer(layer);

  geometryCount++;

  document.getElementById(
    "geometryCount"
  ).textContent = geometryCount;

  analyzeGeometry(layer);

});

// Draw Deleted
map.on(L.Draw.Event.DELETED, function () {

  geometryCount = drawnItems.getLayers().length;

  document.getElementById(
    "geometryCount"
  ).textContent = geometryCount;

});

// Geometry Analysis
function analyzeGeometry(layer) {

  // Circle
  if(layer instanceof L.Circle) {

    const radius =
      (layer.getRadius() / 1000).toFixed(2);

    const area =
      (
        Math.PI *
        Math.pow(layer.getRadius(), 2)
      ) / 1000000;

    alert(
      `Circle Radius: ${radius} km\nArea: ${area.toFixed(2)} km²`
    );

  }

  // Polyline
  else if(layer instanceof L.Polyline &&
          !(layer instanceof L.Polygon)) {

    const latlngs =
      layer.getLatLngs();

    let totalDistance = 0;

    for(let i = 0; i < latlngs.length - 1; i++) {

      totalDistance +=
        latlngs[i].distanceTo(latlngs[i + 1]);

    }

    document.getElementById(
      "distanceValue"
    ).textContent =
      `${(totalDistance / 1000).toFixed(2)} km`;

  }

  // Polygon
  else if(layer instanceof L.Polygon) {

    const geojson =
      layer.toGeoJSON();

    const area =
      turf.area(geojson);

    alert(
      `Polygon Area: ${(area / 1000000).toFixed(2)} km²`
    );

  }

}

// Current Location
document.getElementById(
  "locateBtn"
).addEventListener("click", () => {

  if(!navigator.geolocation) {

    alert("Geolocation not supported");

    return;
  }

  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      if(currentLocationMarker) {

        map.removeLayer(currentLocationMarker);

      }

      currentLocationMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Current Location")
        .openPopup();

      map.flyTo([lat, lng], 13);

    },

    () => {

      alert("Unable to fetch location");

    }

  );

});

// Buffer Tool
// document.getElementById(
//   "bufferBtn"
// ).addEventListener("click", () => {

//   alert(
//     "Click anywhere on map to create 25km spatial analysis zone"
//   );

//   map.once("click", (e) => {

//     if(bufferCircle) {

//       map.removeLayer(bufferCircle);

//     }

//     bufferCircle = L.circle(
//       e.latlng,
//       {

//         radius: CONFIG.BUFFER_RADIUS,

//         color: "#7c3aed",

//         fillColor: "#8b5cf6",

//         fillOpacity: 0.2

//       }
//     ).addTo(map);

//     map.fitBounds(
//       bufferCircle.getBounds()
//     );

//   });

// });


// GIS BUFFER TOOL
const radiusSlider =
  document.getElementById(
    "bufferRadius"
  );

const radiusValue =
  document.getElementById(
    "radiusValue"
  );

const createBufferBtn =
  document.getElementById(
    "createBuffer"
  );

let bufferMode = false;


// RADIUS SLIDER
radiusSlider.addEventListener(
  "input",
  () => {

    radiusValue.textContent =
      radiusSlider.value;

    // LIVE UPDATE BUFFER
    if(bufferLayer) {

      bufferLayer.setRadius(
        radiusSlider.value * 1000
      );

      analyzeGeometry(bufferLayer);

    }

  }
);


// ACTIVATE BUFFER MODE
createBufferBtn.addEventListener(
  "click",
  () => {

    bufferMode = true;

    alert(
      "Buffer Tool Active\nClick anywhere on map"
    );

  }
);


// MAP CLICK → CREATE BUFFER
map.on("click", (e) => {

  if(!bufferMode) return;

  bufferMode = false;

  bufferLayer = L.circle(
    e.latlng,
    {

      radius:
        radiusSlider.value * 1000,

      color: "#7c3aed",

      weight: 2,

      fillColor: "#8b5cf6",

      fillOpacity: 0.2

    }
  );

  // ADD TO DRAW SYSTEM
  drawnItems.addLayer(bufferLayer);

  geometryCount++;

  document.getElementById(
    "geometryCount"
  ).textContent = geometryCount;

  analyzeGeometry(bufferLayer);

});