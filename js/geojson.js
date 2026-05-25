// GIS LAYER REGISTRY
const geojsonLayers = [];

const layerList =
  document.getElementById(
    "layerList"
  );

// GEOJSON UPLOAD
document.getElementById(
  "geojsonInput"
).addEventListener("change", (event) => {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function (e) {

    try {

      const geojson =
        JSON.parse(e.target.result);

      // CREATE LAYER
      const layer = L.geoJSON(
        geojson,
        {
          renderer: L.canvas(),

          style: {

            color: getRandomColor(),

            weight: 2,

            fillOpacity: 0.2

          },

          onEachFeature: function (feature, layer) {

            const originalStyle = {
              color: layer.options.color,
              weight: layer.options.weight,
              fillOpacity: layer.options.fillOpacity
            };

            if (feature.properties) {

              let popupContent = "";

              for (const key in feature.properties) {
                popupContent += `<b>${key}</b>: ${feature.properties[key]}<br>`;
              }

              layer.bindPopup(popupContent);
            }

            layer.on("mouseover", () => {

              if (layer.setStyle) {
                layer.setStyle({
                  color: "#f59e0b",
                  weight: 4,
                  fillOpacity: originalStyle.fillOpacity
                });
              }

            });

            layer.on("mouseout", () => {

              if (layer.setStyle) {
                layer.setStyle(originalStyle);
              }

            });

          }

        }
      ).addTo(map);

      // STORE LAYER
      const layerData = {
        id: Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        layer
      };

      geojsonLayers.push(layerData);

      // CREATE UI
      createLayerItem(layerData);

      // FIT MAP
      if (layer.getBounds().isValid()) {

        map.fitBounds(
          layer.getBounds()
        );

      }

      alert(
        "GeoJSON Loaded Successfully"
      );
      event.target.value = "";

    }
    catch (error) {

      console.error(error);

      alert("Invalid GeoJSON File");

    }

  };

  reader.readAsText(file);

});


// CREATE LAYER ITEM
function createLayerItem(layerData) {

  const item =
    document.createElement("div");

  item.className = "layer-card";

  item.innerHTML = `
  <div class="layer-header">
    <div class="layer-name" title="${layerData.name}">
      ${layerData.name}
    </div>

    <label class="toggle">
      <input type="checkbox" checked />
      <span></span>
    </label>
  </div>

  <div class="layer-footer">
    <button class="table-btn">Table</button>
    <button class="zoom-btn">Zoom</button>
    <button class="remove-btn">Remove</button>
  </div>
`;

  // TOGGLE VISIBILITY
  const checkbox =
    item.querySelector("input");

  checkbox.addEventListener(
    "change",
    () => {

      if (checkbox.checked) {

        map.addLayer(
          layerData.layer
        );

      }
      else {

        map.removeLayer(
          layerData.layer
        );

      }

    }
  );

  const color = getRandomColor();
  layerData.color = color;

  // ATTRIBUTE TABLE
  item.querySelector(".table-btn")
    .addEventListener("click", () => {

      openAttributeTable(layerData);

    });

  // ZOOM TO LAYER
  item.querySelector(".zoom-btn")
    .addEventListener("click", () => {

      map.fitBounds(
        layerData.layer.getBounds()
      );

    });

  // REMOVE LAYER
  item.querySelector(".remove-btn")
    .addEventListener("click", () => {
      if (map.hasLayer(layerData.layer)) {
        map.removeLayer(layerData.layer);
      }

      const index = geojsonLayers.findIndex(
        l => l.id === layerData.id
      );

      if (index !== -1) {
        geojsonLayers.splice(index, 1);
      }

      item.remove();

    });

  layerList.appendChild(item);

}


// RANDOM GIS COLORS
function getRandomColor() {

  const colors = [
    "#06b6d4", // cyan
    "#d946ef", // fuchsia
    "#84cc16", // lime
    "#f97316", // orange
    "#dc2626", // deep red
    "#7c3aed", // violet
    "#14b8a6", // teal
    "#9333ea", // purple
    "#0f766e", // dark teal
    "#1d4ed8", // royal blue
    "#be123c", // rose
    "#a16207", // amber brown
    "#16a34a", // green
    "#4f46e5", // indigo
    "#c026d3", // magenta
    "#ea580c", // burnt orange
    "#0891b2", // sky blue
    "#65a30d", // olive green
    "#b91c1c"  // crimson

  ];

  return colors[
    Math.floor(
      Math.random() * colors.length
    )
  ];

}


// ATTRIBUTE TABLE SYSTEM
const attributeModal =
  document.getElementById(
    "attributeModal"
  );

const attributeTable =
  document.getElementById(
    "attributeTable"
  );

const attributeSearch =
  document.getElementById(
    "attributeSearch"
  );


// CLOSE MODAL
document.getElementById(
  "closeAttribute"
).addEventListener("click", () => {

  attributeModal.classList.remove(
    "active"
  );

});


// OPEN ATTRIBUTE TABLE
function openAttributeTable(layerData) {

  attributeModal.classList.add(
    "active"
  );

  const features = [];

  layerData.layer.eachLayer(layer => {

    if (layer.feature) {

      features.push(layer.feature);

    }

  });

  if (features.length === 0) return;

  const columns =
    Object.keys(
      features[0].properties || {}
    );

  // TABLE HEAD
  let thead = "<tr>";

  columns.forEach(col => {

    thead += `<th>${col}</th>`;

  });

  thead += "</tr>";

  attributeTable.querySelector(
    "thead"
  ).innerHTML = thead;

  // TABLE BODY
  renderTableRows(
    features,
    columns,
    layerData
  );

  // SEARCH
  attributeSearch.oninput = () => {

    const term =
      attributeSearch.value
        .toLowerCase();

    const filtered =
      features.filter(feature => {

        return JSON.stringify(
          feature.properties
        )
          .toLowerCase()
          .includes(term);

      });

    renderTableRows(
      filtered,
      columns,
      layerData
    );

  };

}


// RENDER TABLE ROWS
function renderTableRows(
  features,
  columns,
  layerData
) {

  let tbody = "";

  features.forEach((feature, index) => {

    tbody += `
      <tr
        class="attribute-row"
        data-index="${index}"
      >
    `;

    columns.forEach(col => {

      tbody += `
        <td>
          ${feature.properties[col] ?? ""}
        </td>
      `;

    });

    tbody += "</tr>";

  });

  attributeTable.querySelector(
    "tbody"
  ).innerHTML = tbody;

  // ROW CLICK → ZOOM FEATURE
  const rows =
    document.querySelectorAll(
      ".attribute-row"
    );

  rows.forEach((row, index) => {

    row.addEventListener(
      "click",
      () => {

        let targetLayer = null;

        let current = 0;

        layerData.layer.eachLayer(layer => {

          if (layer.feature) {

            if (current === index) {

              targetLayer = layer;

            }

            current++;

          }

        });

        if (targetLayer) {

          attributeModal.classList.remove("active");
          setTimeout(() => {

            if (targetLayer.getBounds) {

              map.fitBounds(
                targetLayer.getBounds()
              );

            }
            else if (targetLayer.getLatLng) {

              map.flyTo(
                targetLayer.getLatLng(),
                16
              );

            }

            targetLayer.openPopup();
          }, 200);

        }

      }
    );

  });

}


// SHAPEFILE 4-FILE LOADER
const shpInput = {
  shp: document.getElementById("shp_shp"),
  shx: document.getElementById("shp_shx"),
  dbf: document.getElementById("shp_dbf"),
  prj: document.getElementById("shp_prj")
};

document.getElementById("loadShpBtn")
  .addEventListener("click", async () => {

    try {

      if (
        !shpInput.shp.files[0] ||
        !shpInput.shx.files[0] ||
        !shpInput.dbf.files[0] ||
        !shpInput.prj.files[0]
      ) {

        alert(
          "Please select:\n\n" +
          ".shp\n" +
          ".shx\n" +
          ".dbf\n" +
          ".prj"
        );
        return;

      }


      // VALIDATE SAME FILE NAMES
      const shpName =
        shpInput.shp.files[0].name
          .replace(".shp", "");

      const shxName =
        shpInput.shx.files[0].name
          .replace(".shx", "");

      const dbfName =
        shpInput.dbf.files[0].name
          .replace(".dbf", "");

      const prjName =
        shpInput.prj.files[0].name
          .replace(".prj", "");


      if (
        shpName !== shxName ||
        shpName !== dbfName ||
        shpName !== prjName
      ) {

        alert(
          "All shapefile components must have the same filename"
        );

        return;

      }

      // FILE BUFFERS
      const shpBuffer =
        await shpInput.shp.files[0].arrayBuffer();

      const shxBuffer =
        await shpInput.shx.files[0]
          .arrayBuffer();

      const dbfBuffer =
        await shpInput.dbf.files[0].arrayBuffer();

      const prjText =
        await shpInput.prj.files[0]
          .text();


      // CRS DETECTION
      let detectedCRS = "Unknown CRS";

      if (
        prjText.includes("WGS_1984") ||
        prjText.includes("WGS 84")
      ) {

        detectedCRS = "EPSG:4326";

      }
      else if (
        prjText.includes("Pseudo-Mercator")
      ) {

        detectedCRS = "EPSG:3857";

      }

      console.log(
        "Detected CRS:",
        detectedCRS
      );

      console.log(
        "PRJ CONTENT:",
        prjText
      );

      // PARSE SHAPEFILE
      const geometry =
        await shp.parseShp(
          shpBuffer,
          shxBuffer
        );

      const attributes =
        await shp.parseDbf(
          dbfBuffer
        );

      const geojson =
        shp.combine([
          geometry,
          attributes
        ]);


      // VALIDATE FEATURES
      if (
        !geojson ||
        !geojson.features ||
        geojson.features.length === 0
      ) {

        alert(
          "Invalid or empty shapefile"
        );

        return;

      }


      // ADD TO MAP
      addGISLayerFromGeoJSON(
        geojson,
        shpInput.shp.files[0].name
      );

      alert(
        "Shapefile Loaded Successfully\n\n" +
        `Features: ${geojson.features.length}\n` +
        `CRS: ${detectedCRS}`
      );


      Object.values(shpInput).forEach(input => {
        input.value = "";

        const card =
          input.closest(".shape-card");

        card.classList.remove(
          "selected"
        );

      });

      document.getElementById("name_shp").textContent = "No file selected";
      document.getElementById("name_shx").textContent = "No file selected";
      document.getElementById("name_dbf").textContent = "No file selected";
      document.getElementById("name_prj").textContent = "No file selected";

    }

    catch (err) {

      console.error(err);

      alert("Failed to load shapefile");

    }

  });

// RESET ALL SHAPEFILE INPUTS
document.getElementById(
  "resetShpBtn"
).addEventListener("click", () => {

  Object.values(shpInput)
    .forEach(input => {

      input.value = "";

      const card =
        input.closest(".shape-card");

      card.classList.remove(
        "selected"
      );

    });

  document.getElementById(
    "name_shp"
  ).textContent = "No file selected";

  document.getElementById(
    "name_shx"
  ).textContent = "No file selected";

  document.getElementById(
    "name_dbf"
  ).textContent = "No file selected";

  document.getElementById(
    "name_prj"
  ).textContent = "No file selected";

});



function setupFileName(
  inputId,
  labelId
) {

  const input =
    document.getElementById(inputId);

  const label =
    document.getElementById(labelId);

  const card =
    input.closest(".shape-card");

  input.addEventListener(
    "change",
    () => {

      if (input.files.length) {

        label.textContent =
          input.files[0].name;

        card.classList.add(
          "selected"
        );

      }
      else {

        label.textContent =
          "No file selected";

        card.classList.remove(
          "selected"
        );

      }

    }
  );

}

setupFileName(
  "shp_shp",
  "name_shp"
);

setupFileName(
  "shp_shx",
  "name_shx"
);

setupFileName(
  "shp_dbf",
  "name_dbf"
);

setupFileName(
  "shp_prj",
  "name_prj"
);



function addGISLayerFromGeoJSON(
  geojson,
  layerName
) {

  const layer = L.geoJSON(
    geojson,
    {

      renderer: L.canvas(),

      style: {

        color: getRandomColor(),
        weight: 2,
        fillOpacity: 0.2

      },

      onEachFeature: function (feature, layer) {

        const originalStyle = {
          color: layer.options.color,
          weight: layer.options.weight,
          fillOpacity: layer.options.fillOpacity
        };

        if (feature.properties) {

          let popupContent = "";

          for (const key in feature.properties) {
            popupContent += `<b>${key}</b>: ${feature.properties[key]}<br>`;
          }

          layer.bindPopup(popupContent);
        }

        layer.on("mouseover", () => {

          if (layer.setStyle) {
            layer.setStyle({
              color: "#f59e0b",
              weight: 4,
              fillOpacity: originalStyle.fillOpacity
            });
          }

        });

        layer.on("mouseout", () => {

          if (layer.setStyle) {
            layer.setStyle(originalStyle);
          }

        });

      }

    }
  ).addTo(map);

  const layerData = {
    id: Date.now(),
    name: layerName.replace(/\.[^/.]+$/, ""),
    layer
  };

  geojsonLayers.push(layerData);

  createLayerItem(layerData);

  map.fitBounds(
    layer.getBounds()
  );

}