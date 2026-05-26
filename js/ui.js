// Theme Toggle
const themeToggle =
  document.getElementById(
    "themeToggle"
  );

// Detect System Theme
const prefersDark =
  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

if (prefersDark) {

  document.body.classList.add("dark");

  themeToggle.checked = true;

}

// Manual Toggle
themeToggle.addEventListener(
  "change",
  () => {

    document.body.classList.toggle(
      "dark"
    );

  }
);

//Export Button
document.getElementById("exportMapBtn").addEventListener("click", async () => {

  const isDark = document.body.classList.contains("dark");

  const mapContainer = document.getElementById("map");

  // Create overlay container (temporary)
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "800";
  overlay.style.pointerEvents = "none";

  // TITLE (top center)
  const title = document.createElement("div");
  const mapTitle = prompt("Enter map title:", "My GIS Map") || "GIS Map";
  title.innerText = mapTitle;
  title.style.position = "absolute";
  title.style.top = "12px";
  title.style.left = "50%";
  title.style.transform = "translateX(-50%)";
  title.style.fontSize = "24px";
  title.style.fontWeight = "bold";
  title.style.color = isDark ? "#f3f4f6" : "#111827";
  title.style.background = isDark
    ? "rgba(15,23,42,0.75)"
    : "rgba(255,255,255,0.7)";
  title.style.padding = "6px 12px";
  title.style.borderRadius = "8px";


  // LOGO (top-left)
  const logo = document.createElement("img");
  logo.src = "assets/logo.png"
  logo.style.position = "absolute";
  logo.style.top = "10px";
  logo.style.left = "20px";
  logo.style.height = "60px";


  // NORTH ARROW (top-right)
  const north = document.createElement("div");

  north.innerHTML = "⬆ N";

  north.style.position = "absolute";
  north.style.top = "30px";
  north.style.right = "85px";
  north.style.fontSize = "18px";
  north.style.fontWeight = "bold";
  north.style.textAlign = "center";
  north.style.width = "40px";
  north.style.height = "40px";
  north.style.display = "flex";
  north.style.alignItems = "center";
  north.style.justifyContent = "center";

  north.style.borderRadius = "50%";
  north.style.border = isDark
    ? "2px solid #f3f4f6"
    : "2px solid #111827";

  north.style.color = isDark ? "#f3f4f6" : "#111827";
  north.style.background = isDark
    ? "rgba(15,23,42,0.6)"
    : "rgba(255,255,255,0.7)";

  // DATE TIME (bottom-left)
  const date = document.createElement("div");
  const now = new Date();

  date.innerText =
    now.toLocaleDateString() + " " + now.toLocaleTimeString();

  date.style.position = "absolute";
  date.style.bottom = "10px";
  date.style.left = "10px";
  date.style.fontSize = "12px";
  date.style.color = isDark ? "#f3f4f6" : "#111827";

  date.style.background = isDark
    ? "rgba(15,23,42,0.6)"
    : "rgba(255,255,255,0.7)";
  date.style.padding = "4px 8px";
  date.style.borderRadius = "6px";


  //legend
  const legend = document.createElement("div");

  legend.style.position = "absolute";
  legend.style.bottom = "20px";
  legend.style.right = "65px";
  legend.style.background = isDark
    ? "rgba(15,23,42,0.85)"
    : "rgba(255,255,255,0.85)";

  legend.style.color = isDark ? "#f3f4f6" : "#111827";
  legend.style.padding = "10px";
  legend.style.borderRadius = "10px";
  legend.style.fontSize = "12px";

  legend.innerHTML = "<b>Legend</b><br>";

  geojsonLayers.forEach(layerObj => {

    const color = layerObj.layer.options?.style?.color || "#2563eb";

    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "6px";
    item.style.marginTop = "5px";

    item.innerHTML = `
    <span style="
      width:12px;
      height:12px;
      background:${color};
      display:inline-block;
      border-radius:3px;
    "></span>
    <span>${layerObj.name}</span>
  `;

    legend.appendChild(item);

  });


  overlay.appendChild(title);
  overlay.appendChild(logo);
  overlay.appendChild(north);
  overlay.appendChild(date);
  overlay.appendChild(legend);

  mapContainer.appendChild(overlay);

  map.invalidateSize();

  await new Promise(resolve => {

    logo.onload = () => {

      setTimeout(resolve, 1500);

    };

  });

  html2canvas(mapContainer, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    scale: 4
  })
    .then(canvas => {
      const cropRight = 240;

      const croppedCanvas = document.createElement("canvas");
      const ctx = croppedCanvas.getContext("2d");

      croppedCanvas.width = canvas.width - cropRight;
      croppedCanvas.height = canvas.height;

      ctx.drawImage(
        canvas,
        0, 0, canvas.width - cropRight, canvas.height,
        0, 0, canvas.width - cropRight, canvas.height
      );

      const dataURL = croppedCanvas.toDataURL("image/png");

      if (dataURL === "data:,") {
        showToast("Export failed", "error");
        overlay.remove();
        return;
      }

      const link = document.createElement("a");
      link.download = "map_export.png";
      link.href = dataURL;
      link.click();

      overlay.remove();
    });
});

// Sidebar Panel Animation
const panels =
  document.querySelectorAll(".panel");

panels.forEach((panel, index) => {

  panel.style.animationDelay =
    `${index * 0.1}s`;

});

// Smooth Fly Animation Utility
function smoothFly(lat, lng, zoom = 13) {

  map.flyTo(
    [lat, lng],
    zoom,
    {
      animate: true,
      duration: 2
    }
  );

}