mapboxgl.accessToken = 'pk.eyJ1IjoibmloZTA3NjAiLCJhIjoiY2p1bzhmOWI1MnJsODQxb2FnaTdmb3J0NyJ9.pPdj9B-Ql2FTGrqZsbceEg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [0, 0],
    //maxBounds: [[-180, -85], [180, 85]],
    zoom: 1
});

var url = '/findiss';

map.on('load', function () {

    window.setInterval(function () {
        fetch(url).then(function (response) {
            return response.json();
        })
            .then(function (json) {
                var data = json,
                    issLastSeen = data.features[0].geometry.coordinates,
                    details = data.features[0].properties,
                    resultingDOM = "";

                for (var prop in details) {
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

    map.addSource('iss', {type: 'geojson', data: url});
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
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }   
    }
    map.addLayer({
        'id': 'urban-areas-fill',
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

    map.addLayer({
        'id': 'test',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson'
        }
    });

    map.addControl(new mapboxgl.FullscreenControl());

    document.getElementById('locate').addEventListener('click', function (e) {
        var lastSeenLocaton = JSON.parse(this.getAttribute('data-coordinate'));
        map.flyTo({
            center: lastSeenLocaton
        });
    });

});

//http://www.naturalearthdata.com/

//https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/  !!!!