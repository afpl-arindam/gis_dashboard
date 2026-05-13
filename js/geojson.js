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

  if(!file) return;

  const reader =
    new FileReader();

  reader.onload = function(e) {

    try {

      const geojson =
        JSON.parse(e.target.result);

      // CREATE LAYER
      const layer = L.geoJSON(
        geojson,
        {

          style: {

            color: getRandomColor(),

            weight: 2,

            fillOpacity: 0.2

          },

          onEachFeature:
            function(feature, featureLayer) {

            if(feature.properties) {

              let popupContent = "";

              for(const key in feature.properties) {

                popupContent += `
                  <b>${key}</b>:
                  ${feature.properties[key]}
                  <br>
                `;

              }

              featureLayer.bindPopup(
                popupContent
              );

            }

          }

        }
      ).addTo(map);

      // STORE LAYER
      const layerData = {

        id: Date.now(),

        name: file.name,

        layer

      };

      geojsonLayers.push(layerData);

      // CREATE UI
      createLayerItem(layerData);

      // FIT MAP
      map.fitBounds(
        layer.getBounds()
      );

      alert(
        "GeoJSON Loaded Successfully"
      );

    }
    catch(error) {

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

  item.className = "layer-item";

  item.innerHTML = `

    <div class="layer-top">

      <input
        type="checkbox"
        checked
      />

      <div class="layer-name">
        ${layerData.name}
      </div>

    </div>

    <div class="layer-actions">

        <button class="table-btn">
            Table
        </button>

        <button class="zoom-btn">
            Zoom
        </button>

        <button class="remove-btn">
            Remove
        </button>

    </div>

  `;

  // TOGGLE VISIBILITY
  const checkbox =
    item.querySelector("input");

  checkbox.addEventListener(
    "change",
    () => {

      if(checkbox.checked) {

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

    map.removeLayer(
      layerData.layer
    );

    item.remove();

  });

  layerList.appendChild(item);

}


// RANDOM GIS COLORS
function getRandomColor() {

  const colors = [

    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899"

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

    if(layer.feature) {

      features.push(layer.feature);

    }

  });

  if(features.length === 0) return;

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
          ${feature.properties[col] || ""}
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

          if(layer.feature) {

            if(current === index) {

              targetLayer = layer;

            }

            current++;

          }

        });

        if(targetLayer) {

          if(targetLayer.getBounds) {

            map.fitBounds(
              targetLayer.getBounds()
            );

          }
          else if(targetLayer.getLatLng) {

            map.flyTo(
              targetLayer.getLatLng(),
              16
            );

          }

          targetLayer.openPopup();

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

    if(
      !shpInput.shp.files[0] ||
      !shpInput.shx.files[0] ||
      !shpInput.dbf.files[0]
    ){
      alert("Please select .shp .shx .dbf files");
      return;
    }

    // Convert files → arrayBuffers
    const shpBuffer = await shpInput.shp.files[0].arrayBuffer();
    const shxBuffer = await shpInput.shx.files[0].arrayBuffer();
    const dbfBuffer = await shpInput.dbf.files[0].arrayBuffer();

    // optional projection
    const prjText = shpInput.prj.files[0]
      ? await shpInput.prj.files[0].text()
      : null;

    // CREATE VIRTUAL SHAPEFILE OBJECT
    const geojson = await shp.combine([
      shp.parseShp(shpBuffer, shxBuffer),
      shp.parseDbf(dbfBuffer)
    ]);

    // ADD TO MAP (reuse system)
    addGISLayerFromGeoJSON(
      geojson,
      "Shapefile Layer"
    );

    alert("Shapefile Loaded Successfully");

  }

  catch(err){
    console.error(err);
    alert("Failed to load shapefile");
  }

});