var map;
var psLines;
var psLevels;
var info = L.control();

// Function to instantiate the Leaflet map
function createMap() {
    map = L.map('map', {
        center: [44.5613, -123.2788],  // Center the map on Oregon State University
        zoom: 19
    });

    // Add the base tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/underjas/cm6zlihch00ef01sle41zhier/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 19,
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoidW5kZXJqYXMiLCJhIjoiY202eWpqa3AwMHcyZTJucHM2cDBwcnd0NCJ9.RNRXLOp7rDrsdW0qiOHUFw'
    }).addTo(map);

    // Initialize the radio button control for filtering
    addRadioButtonControl();

    // Set the default selected level (Level 1)
    document.querySelector('input[name="level"][value="1"]').checked = true;
    filterLayersByLevel(1); // Automatically filter by Level 1
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
        where: "Level_ = " + level // Filter for the selected level
    });
}

// Function to add radio button control for filtering
function addRadioButtonControl() {
    const radioControl = L.control({ position: 'topright' });
    radioControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-control-radio');
        div.innerHTML = `
            <h4>Choose a Parking<br>Structure Level<h4>
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
    console.log("Filtering layers by level: " + level); // Debugging line
    
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
}

// Initialize map
document.addEventListener('DOMContentLoaded', function () {
    createMap();
});
