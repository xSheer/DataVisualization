/**
 * An express application which serves root route and provides an API 
 * to get current ISS coordinates, usgs earthquakes, urban areas and 
 * tectonic plates in GeoJSON format.
 */

var request = require('request'),
    geojson = require('geojson'),
    express = require('express'),
    path = require('path'),
    fs = require('fs'),
    tectonicPlate = require('./Source/tectonic_plates_boundaries.json');

const { exec } = require('child_process');

let ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";
let USGS_EARTHQUAKES = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
let URBAN_AREAS = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson";

let file = fs.createWriteStream('./Source/earthquakes_month.json');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/findiss', function (req, res) {
    request(ISS_URL, function (err, resp, body) {
        if (err) {
            console.log(err);
            res.status(400).json({error: 'Unable to contact ISS API'});
            return;
        }

        var apiResponse = JSON.parse(body);
        var issGeoJSON = geojson.parse([apiResponse], {Point: ['latitude', 'longitude']});

        res.json(issGeoJSON);
    });
});

app.get('/getUrbanAreas', function (req, res) {
    request(URBAN_AREAS, function (err, resp, body) {
        if (err) {
            console.log(err);
            res.status(400).json({error: 'Unable to connect Urban Areas API'});
            return;
        }

        var apiResponse = JSON.parse(body);
        res.json(apiResponse);
    });
});

app.get('/getEarthquake', function (req, res) {
    request(USGS_EARTHQUAKES, function (err, resp, body) {
    if (err) {
        console.log(err);
        res.status(400).json({error: 'Unable to contact usgs earthquakes API'});
        return;
    }

    //writing geojson into file to clean it up afterwards for a better performance 
    var apiResponse = JSON.parse(body);
    fs.writeFile("./Source/earthquakes_month.json", body, (err) => {
        if (err) throw err;
        file.end();
    });

    //setting unnecessary data to null
    for(var i = 0; i < apiResponse.features.length; i++){
        apiResponse.features[i].properties.url = null;
        apiResponse.features[i].properties.detail = null;
    }

    res.json(apiResponse);
    });
});

app.get('/getTectonicPlate', function (req, res) {
    res.json(tectonicPlate);
});

app.listen(app.get('port'), function () {
    console.log("App listening on port " + app.get('port'));
});

exec('geojson-pick code < Source/earthquakes_month.json > Source/earthquakes_month_cleaned.json', (err, stdout, stderr) => {
    if (err) {
        console.log("node couldn't execute the command");
        return;
    }
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
});