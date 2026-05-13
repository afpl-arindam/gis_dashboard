// Zoom Analytics
const zoomLevel =
  document.getElementById("zoomLevel");

map.on("zoomend", () => {

  zoomLevel.textContent =
    map.getZoom();

});

// Initial Zoom
zoomLevel.textContent =
  map.getZoom();

// Coordinate Tracking
const coordinates =
  document.getElementById("coordinates");

map.on("mousemove", (e) => {

  const lat =
    e.latlng.lat.toFixed(5);

  const lng =
    e.latlng.lng.toFixed(5);

  coordinates.textContent =
    `${lat}, ${lng}`;

});