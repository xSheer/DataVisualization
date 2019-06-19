mapboxgl.accessToken = 'pk.eyJ1IjoibmloZTA3NjAiLCJhIjoiY2p1bzhmOWI1MnJsODQxb2FnaTdmb3J0NyJ9.pPdj9B-Ql2FTGrqZsbceEg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [0, 0],
    //maxBounds: [[-180, -85], [180, 85]],
    zoom: 1
});

let findiss = '/findiss';
let tectonicPlates = '/getTectonicPlate';
let earthquakes = '/getEarthquake';
let urbanAreas = '/getUrbanAreas';
let earthquakeNumber = '/getEarthquakeCount';
let earthquakeCount = 0;

let earthquakeId = null;
let state = { panelOpen: true };
let popup;

async function drawEarthquakeNumbers(){
    let para = document.createElement("p");
    let node = document.createTextNode("Number of earthquakes within the last 30 days: " + await $.get(earthquakeNumber)+".");
    document.getElementById("console").querySelector("p").appendChild(para);
    para.appendChild(node);
}
drawEarthquakeNumbers();

map.on('load', function () {

    let filterMagnitude = ['all', ['>=', ['number', ['get', 'mag']], 3-0.5], ['<=', ['number', ['get', 'mag']], 3+0.5]];
    let filterTime = ['<=', 0 ,['number',['get', 'time']]];

    window.setInterval(function () {
        fetch(findiss).then(function (response) {
            return response.json();
        })
            .then(function (json) {
                var data = json,
                    issLastSeen = data.features[0].geometry.coordinates,
                    details = data.features[0].properties,
                    resultingDOM = "";

                for (var prop in details) {
                    if(prop == 'name')
                        resultingDOM += "<span class='title'>" + prop.toUpperCase() + "</span>" + " " + details[prop] + "</br>";
                    else if(prop == 'solar_lat'|| prop == 'solar_lon' || prop == 'velocity'){
                        resultingDOM += "<span class='title'>" + prop.toUpperCase() + "</span>" + " " + details[prop].toFixed(3) + "</br>";
                    }
                }
                document.getElementById('details').innerHTML = resultingDOM;
                document.getElementById('locate').setAttribute("data-coordinate", JSON.stringify(issLastSeen));

                map.getSource('iss').setData(data);
            })
            .catch(function (error) {
                console.log(error);
            });

    }, 2000);

    map.addSource('iss', {type: 'geojson', data: findiss});
    map.addLayer({
        "id": "iss",
        "type": "symbol",
        "source": "iss",
        "layout": {
            "icon-image": "rocket-15"
        }
    });

    map.addSource('urbanAreas', {type: 'geojson', data: urbanAreas});
    map.addLayer({
        'id': 'urban-areas',
        'type': 'fill',
        'source': 'urbanAreas',
        'layout': {},
        'paint': {
            'fill-color': '#f08',
            'fill-opacity': 0.4
        }
    }, 'waterway-label');

    map.addSource('earthquake', {type: 'geojson', data: earthquakes, generateId: true});
    map.addLayer({
        "id": "earthquakes-heat",
        "type": "heatmap",
        "source": "earthquake",
        "maxzoom": 9,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0,
                6, 1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                9, 3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            // Try ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(69,117,180,0)",
                0.2, "rgb(145,191,219)",
                0.4, "rgb(224,243,248)",
                0.6, "rgb(254,224,144)",
                0.8, "rgb(252,141,89)",
                1, "rgb(215,48,39)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 2,
                9, 20
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],
        }
    }, 'waterway-label');

    map.addLayer({
        "id": "earthquakes-point",
        "type": "circle",
        "source": "earthquake",
        "minzoom": 7,
        "paint": {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 1,
                    6, 4
                ],
                16, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 5,
                    6, 50
                ]
            ],
            // Color circle by earthquake magnitude
            "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                1, "rgba(33,102,172,0)",
                2, "rgb(103,169,207)",
                3, "rgb(209,229,240)",
                4, "rgb(253,219,199)",
                5, "rgb(239,138,98)",
                6, "rgb(178,24,43)"
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            // Transition from heatmap to circle layer by zoom level
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                8, 1
            ]
        }
    }, 'waterway-label');

    map.addSource('tectonicPlates', {type: 'geojson', data: tectonicPlates});
    map.addLayer({
        "id": "tectonic-plates",
        "type": "line",
        "source": 'tectonicPlates',
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "rgba(33,102,172,0.3)",
            "line-width": 2
        }
    });

    document.getElementById('locate').addEventListener('click', function (e) {
        var lastSeenLocaton = JSON.parse(this.getAttribute('data-coordinate'));
        map.flyTo({
            center: lastSeenLocaton
        });
    });

    map.on('mouseenter', 'earthquakes-point', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['earthquakes-point']
        });
      
        if (!features.length) {
          return;
        }

        var feature = features[0];
      
       popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(feature.geometry.coordinates)
          .setHTML('<h3>Earthquake Detail</h3>' +
                        '<p><b>Magnitude: </b>' + feature.properties.mag.toFixed(2) + '</p>' +
                        '<p><b>Time: </b>' + new Date(feature.properties.time) + '</p>' +
                        '<p><b>Place: </b>' + feature.properties.place + '</p>' +
                        '<p><b>Long: </b>' + feature.geometry.coordinates[0].toFixed(2) + '</p>' +
                        '<p><b>Lat: </b>' + feature.geometry.coordinates[1].toFixed(2) + '</p>'
                    )
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
    });

    map.on('mouseleave', 'earthquakes-point', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    document.getElementById('slider').addEventListener('input', function(e) {
        var mag = parseInt(e.target.value);

        // update the map
        if(mag === 1){
            filterMagnitude = ['all', ['>=', ['number', ['get', 'mag']], mag-0.9], ['<=', ['number', ['get', 'mag']], mag+0.5]];
        }else if(mag === 2){
            filterMagnitude = ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]];
        }else if(mag === 3){
            filterMagnitude = ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]];
        }else if(mag === 4){
            filterMagnitude =['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]];
        }else if(mag === 5){
            filterMagnitude = ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+1]];
        }else if(mag === 6){
            filterMagnitude = ['>=', ['number', ['get', 'mag']], mag];
        }

        setFilters();
      
        let currentMagText = 'from: '+ (mag-0.5) +' to: '+(mag+0.5);

        if(mag >= 0.1 && mag <= 1.5){
            currentMagText = 'from: 0.1 to: '+(mag+0.5);
        }
        else if(mag >= 6){
            currentMagText = '6+'
        }
        // update text in the UI
        document.getElementById('current-magnitude').innerText = currentMagText;
    });

    document.getElementById('filters').addEventListener('change', function(e) {
        var time = e.target.value;
        let selectedTimeRatio = 0;

        // update the map filter
        if (time === 'month') {
            filterTime = ['<=', selectedTimeRatio ,['number',['get', 'time']]];
        } else if (time === 'week') {
            selectedTimeRatio = new Date().getTime() - 604800000;
            filterTime = ['<=', selectedTimeRatio ,['number',['get', 'time']]];
        } else if (time === 'today') {
            selectedTimeRatio = new Date().getTime() - 86400000;
            filterTime =['<=', selectedTimeRatio ,['number',['get', 'time']]];
        }
        setFilters();
    });

    function setFilters(){
        map.setFilter('earthquakes-point', ['all', filterMagnitude, filterTime]);
        map.setFilter('earthquakes-heat', ['all', filterMagnitude, filterTime]);
    }

    //default settings of menu will get applied at the start
    setFilters();
});

var toggleableLayerIds = ['tectonic-plates', 'earthquakes-heat', 'urban-areas'];
 
for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
    
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;
    
    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
        
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        
        if (visibility === 'visible' || visibility === undefined) {
            this.className = '';
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };
    
    var layers = document.getElementById('button');
    layers.appendChild(link);
}

function panelSelect(e){
  if(state.panelOpen){
    document.getElementById('descriptionPanel').style.height = '25px';
    document.getElementById('glyph').className = "fas fa-angle-up fa-2x";
    state.panelOpen = false;
  } else {
    document.getElementById('descriptionPanel').style.height = '420px';
    document.getElementById('glyph').className = "fas fa-angle-down fa-2x";
    state.panelOpen = true;
  }
}

document.getElementById("help").addEventListener("click", function(){
    document.getElementById("helpMsg").style.display = "block";
});

document.getElementById("popupCloseButton").addEventListener("click", function(){
    document.getElementById("helpMsg").style.display = "none";
});

map.addControl(new mapboxgl.FullscreenControl());

//TODO: switching maps like light or dark (maybe search another way!)
//TODO: corrent circle size depending on magnitude (magnitude is alright calculated down via log10)
//TODO: Maybe button to trigger timelaps of 30 days within 30 seconds

// Earthquake’s magnitude is measured in logarithmic scale. Which means an earthquake with magnitude 5 is 10 times stronger than one with magnitude 4. 
// Also, area of a circle is proportional to the square of its radius. 
// So, √ (10^ (magnitude)) would be a better variable to compare the strength of an earthquake than the magnitude in Richter scale, 
// if we are encoding it with the size of circle.