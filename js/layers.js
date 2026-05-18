// Street Layer
const streetLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    // attribution: "&copy; OpenStreetMap"
    crossOrigin: true
  }
);

// Satellite Layer
const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    // attribution: "Esri"
  }
);

// Terrain Layer
const terrainLayer = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    // attribution: "OpenTopoMap"
  }
);

// Dark Layer
const darkLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    // attribution: "CartoDB"
  }
);

// Default Layer
streetLayer.addTo(map);

// Layer Controller
L.control.layers({

  "Street Map": streetLayer,
  "Satellite": satelliteLayer,
  "Terrain": terrainLayer,
  "Dark Mode": darkLayer

}).addTo(map);