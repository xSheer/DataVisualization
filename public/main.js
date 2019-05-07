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

map.on('load', function () {

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
                    if(prop == 'name' || prop == 'velocity' || prop == 'solar_lat'|| prop == 'solar_lon')
                    resultingDOM += "<span class='title'>" + prop.toUpperCase() + "</span>" + " " + details[prop] + "</br>";
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

    var layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    //TODO: Log firstSymbolId!
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }   
    }
    map.addLayer({
        'id': 'urban-areas',
        'type': 'fill',
        'source': {
        'type': 'geojson',
            'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson'
        },
        'layout': {},
        'paint': {
            'fill-color': '#f08',
            'fill-opacity': 0.4
        }
    }, firstSymbolId);

    map.addSource('earthquake', {type: 'geojson', data: earthquakes});
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
        "id": "route",
        "type": "line",
        "source": 'tectonicPlates',
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "rgba(33,102,172,0.3)",
            "line-width": 4
        }
    });

    map.addControl(new mapboxgl.FullscreenControl());

    document.getElementById('locate').addEventListener('click', function (e) {
        var lastSeenLocaton = JSON.parse(this.getAttribute('data-coordinate'));
        map.flyTo({
            center: lastSeenLocaton
        });
    });

    map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['earthquakes-point']
        });
      
        if (!features.length) {
          return;
        }

        var feature = features[0];
      
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(feature.geometry.coordinates)
          .setHTML('<h3>Earthquake Detail</h3>' +
                        '<p><b>Magnitude: </b>' + feature.properties.mag + '</p>' +
                        '<p><b>Place: </b>' + feature.properties.place + '</p>'
                    )
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
    });

    document.getElementById('slider').addEventListener('input', function(e) {
        var mag = parseInt(e.target.value);

        // update the map
        if(mag === 1){
            map.setFilter('earthquakes-heat', ['all', ['>=', ['number', ['get', 'mag']], mag-0.9], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
            map.setFilter('earthquakes-point', ['all', ['>=', ['number', ['get', 'mag']], mag-0.9], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
        }else if(mag === 2){
            map.setFilter('earthquakes-heat', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
            map.setFilter('earthquakes-point', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
        }else if(mag === 3){
            map.setFilter('earthquakes-heat', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
            map.setFilter('earthquakes-point', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
        }else if(mag === 4){
            map.setFilter('earthquakes-heat', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
            map.setFilter('earthquakes-point', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
        }else if(mag === 5){
            map.setFilter('earthquakes-heat', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
            map.setFilter('earthquakes-point', ['all', ['>=', ['number', ['get', 'mag']], mag-0.5], ['<=', ['number', ['get', 'mag']], mag+0.5]]);
        }else if(mag === 6){
            map.setFilter('earthquakes-heat', ['>=', ['number', ['get', 'mag']], mag]);
            map.setFilter('earthquakes-point', ['>=', ['number', ['get', 'mag']], mag]);
        }
      
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
            map.setFilter('earthquakes-heat', ['<=', selectedTimeRatio ,['number',['get', 'time']]]);
        } else if (time === 'week') {
            selectedTimeRatio = new Date().getTime() - 604800000;
            map.setFilter('earthquakes-heat', ['<=', selectedTimeRatio ,['number',['get', 'time']]]);
        } else if (time === 'today') {
            selectedTimeRatio = new Date().getTime() - 86400000;
            map.setFilter('earthquakes-heat', ['<=', selectedTimeRatio ,['number',['get', 'time']]]);
        }
      });
});

var toggleableLayerIds = ['earthquakes-heat', 'urban-areas'];
 
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
        
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };
    
    var layers = document.getElementById('button');
    layers.appendChild(link);
}

//http://www.naturalearthdata.com/

//https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/ 

//https://d2ad6b4ur7yvpq.cloudfront.net/

//Expression:
//https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-decision

//tectonic plates
//https://github.com/fraxen/tectonicplates


//TODO: apply mutiple filters at once
//TODO: Button for tectonic, add opacity, make it smaller and below heatmap/earthquake layers
//TODO: implement into the earthquake details "time" of earthquake in days/weeks 
//TODO: switching maps like light or dark
//TODO: add posibillity to pop up/in the menu
//TODO: tektonische platten