/**
 * An express application which serves root route and provides an API 
 * to get current ISS coordinates and usgs earthquakes in GeoJSON format.
 */

var request = require('request'),
    geojson = require('geojson'),
    express = require('express'),
    path = require('path');

let ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";

let USGS_EARTHQUAKES = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

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

app.get('/getEarthquake', function (req, res) {
    request(USGS_EARTHQUAKES, function (err, resp, body) {
    if (err) {
        console.log(err);
        res.status(400).json({error: 'Unable to contact usgs earthquakes API'});
        return;
    }
    var apiResponse = JSON.parse(body);

    res.json(apiResponse);
    });
});

app.listen(app.get('port'), function () {
    console.log("App listening on port " + app.get('port'));
});