// Main Map
const map = L.map("map", {

  zoomControl: false

}).setView(
  CONFIG.DEFAULT_CENTER,
  CONFIG.DEFAULT_ZOOM
);

// Custom Zoom Position
L.control.zoom({
  position: "bottomright"
}).addTo(map);

// Feature Group
const drawnItems = new L.FeatureGroup();

map.addLayer(drawnItems);

// Global Layers
let currentLocationMarker;
let bufferCircle;