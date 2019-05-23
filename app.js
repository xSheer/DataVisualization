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

let earthquakeCount = 0;

// let file = fs.createWriteStream('./Source/earthquakes_month.geojson');

var app = express();

app.set('port', (process.env.PORT || 80));

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
    setTimeout(earthquakesData, 3600000);
    fs.readFile('./Source/earthquakes_month_cleaned.geojson', function (err, data) {
        if (err) {
          throw err; 
        }
        flag = true;
        var apiResponse = JSON.parse(data.toString());
        res.json(apiResponse);
    });
});

app.get('/getEarthquakeCount', function (req, res) {
    res.json(earthquakeCount);
});

app.get('/getTectonicPlate', function (req, res) {
    res.json(tectonicPlate);
});

app.listen(app.get('port'), function () {
    console.log("App listening on port " + app.get('port'));
});

let earthquakesData = function(){
    request(USGS_EARTHQUAKES, function (err, resp, body) {
        if (err) {
            console.log(err);
            res.status(400).json({error: 'Unable to contact usgs earthquakes API'});
            return;
        }
        earthquakeCount = JSON.parse(body).features.length;
        //writing geojson into file to clean it up afterwards for a better performance 
        fs.writeFile("./Source/earthquakes_month.geojson", body, (err) => {
            if (err) throw err;
        });
    });
};
earthquakesData();

//Need to wait until earthquakes_month.geojson got loaded and saved into a file.
setTimeout(function(){
    return exec('geojson-pick mag time place < Source/earthquakes_month.geojson > Source/earthquakes_month_cleaned.geojson', (err) => {
        if (err) {
            console.log("node couldn't execute the command"+ err);
            return;
        }
    });
}, 15000);