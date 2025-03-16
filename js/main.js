var map;
var psLines;
var psLevels;
var adaParkingLayer; // Store the ADA parking layer globally
var evParkingLayer; //store EV parking globally
var info = L.control();

// Function to instantiate the Leaflet map
function createMap() {
    map = L.map('map', {
        center: [44.5613, -123.2787],  // Center the map on Oregon State University
        zoom: 18
    });

    // Add the base tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/underjas/cm6zlihch00ef01sle41zhier/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 18,
        maxZoom: 20,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoidW5kZXJqYXMiLCJhIjoiY202eWpqa3AwMHcyZTJucHM2cDBwcnd0NCJ9.RNRXLOp7rDrsdW0qiOHUFw'
    }).addTo(map);

    // Initialize the radio button control for filtering
    addRadioButtonControl();

    // Load ADA Parking after the map is initialized
    getADA();
    getEV();

    // Set the default selected level (Level 1)
    document.querySelector('input[name="level"][value="1"]').checked = true;
    filterLayersByLevel(1); // Automatically filter by Level 1
}

// Function to get ADA Parking
function getADA() { 
    fetch("data/ADA_Parking.geojson")
        .then(response => response.json())
        .then(data => {
            // Remove existing ADA layer if present
            if (adaParkingLayer) {
                map.removeLayer(adaParkingLayer);
            }

            // Create new ADA parking layer
            adaParkingLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            className: 'ada-icon',
                            html: '♿️', // Wheelchair emoji
                            iconSize: [20, 20], // Adjust size as needed
                            iconAnchor: [10, 10] // Centers the emoji
                        })
                    });
                }
            });
            //add ADA Parking is level 1 is selected
            if (document.querySelector('input[name="level"]:checked').value=="1"){
                adaParkingLayer.addTo(map);
            }
        })
        .catch(error => console.error("Error loading ADA Parking GeoJSON:", error));
}

//Function to get EV charging stations
function getEV() {
        fetch ("data/EV_Station.geojson")
            .then(response => response.json())
            .then(data => {
                if (evParkingLayer) {
                    map.removeLayer(evParkingLayer);
                }
            evParkingLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            className: 'ev-icon-container',
                            html: `<div class="ev-icon">⚡</div>`, //charge emoji
                            iconsize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    });
                }
            });
            //add EV icon is level 2 is selected
            if (document.querySelector('input[name="level"]:checked').value =="2"){
                evParkingLayer.addTo(map);
            }
            })
}
// Function to add the parking stripes (PS1 Stalls) layer
function getPS1lines(level) {
    return L.esri.featureLayer({
        url: 'https://services1.arcgis.com/dePSdaG71BplHMCO/arcgis/rest/services/PS1_Stalls/FeatureServer/1',
        where: "Level_ = " + level // Filter for the selected level
    });
}

// Function to add the parking structure levels (PS1 Levels) layer
function getLevels(level) {
    return L.esri.featureLayer({
        url: 'https://services1.arcgis.com/dePSdaG71BplHMCO/arcgis/rest/services/PS1_Levels/FeatureServer/2',
        where: "Level_ = " + level, // Filter for the selected level
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.Zone) {
                layer.bindTooltip(feature.properties.Zone, {
                    permanent: true,
                    direction: 'center',
                    className: 'zone-label',
                    opacity: 1
                });
            }
        }
    });
}

// Function to add radio button control for filtering
function addRadioButtonControl() {
    const radioControl = L.control({ position: 'topright' });
    radioControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-control-radio');
        div.innerHTML = `
            <h4>Choose a Parking<br>Structure Level</h4>
            <form>
                <label><input type="radio" name="level" value="1" /> Level 1</label><br>
                <label><input type="radio" name="level" value="2" /> Level 2</label><br>
                <label><input type="radio" name="level" value="3" /> Level 3</label><br>
                <label><input type="radio" name="level" value="4" /> Level 4</label><br>
                <label><input type="radio" name="level" value="5" /> Level 5</label><br>
            </form>
        `;

        div.addEventListener('change', function (e) {
            const selectedLevel = e.target.value;
            console.log("Radio button selected level: " + selectedLevel); // Debugging line
            filterLayersByLevel(selectedLevel);
        });

        return div;
    };
    radioControl.addTo(map);
}

// Function to filter layers by the selected level
function filterLayersByLevel(level) {
    //console.log("Filtering layers by level: " + level); // Debugging line
    
    // Remove existing layers from the map
    if (psLines) {
        map.removeLayer(psLines);
    }
    if (psLevels) {
        map.removeLayer(psLevels);
    }

    // Get the layers for the selected level and add them to the map
    psLines = getPS1lines(level).addTo(map);
    psLevels = getLevels(level).addTo(map);
    
      // Show ADA Parking only for Level 1
      if (level == "1") {
        if (adaParkingLayer) {
            adaParkingLayer.addTo(map);
        } else {
            getADA(); // Load ADA parking if it hasn't been fetched yet
        }
    } else {
        if (adaParkingLayer) {
            map.removeLayer(adaParkingLayer);
        }
    }
      //Show EV Stations only for Level 2
      if (level == "2") {
        if (evParkingLayer) {
            evParkingLayer.addTo(map);
        } else {
            getEV();
        }
      } else {
            if (evParkingLayer) {
                map.removeLayer(evParkingLayer);
            }
        }
    }

// Initialize map after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    createMap();
});
