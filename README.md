
# Data visualization of earthquakes from U.S. Geological Survey & GeoJson.

## Overview

This project visualizes current ISS coordinates, earthquakes (from usgs), urban areas and 
tectonic plates around the globe. To achieve this goal different 
virtualization methods are used which are mentioned below. 
The backend provides an express application which serves root route and provides an API 
to get uptodate data in GeoJSON format. Total time to load depends on client internet speed & client GPU.
Uncompressed geojson files are 9 MB.

1. Earthquakes got visualized as points with different sizes depending on their magnitude. (Zoom level 7+)
2. Heatmap for regions with high levels of earthquakes got colored via *Brewer Palette* (Zoom level 0+)
3. Plate tectonics got visualized and drawn to see correlations between earthquakes poisition and those moving plates
4. Position of *ISS* live (refreshed every secound) via rocket-symbol

Trigger layer visibility
1. Button for urban areas
2. Button for earthquakes (vielleicht magniatude auswählbar)
3. Button for plate tectonics
4. Button toFly ISS
5. Fullscreen control for a better experience

Categorize visualitation
1. Silder to get specific earthquakes depending on their magnitude range
2. Radio box to impact different timestamps of earthquakes

## Data used
  
**Earthquake data from:** https://earthquake.usgs.gov/earthquakes/search/ <br/>
**GeoJson data from:** https://d2ad6b4ur7yvpq.cloudfront.net/ <br/>
**Map projection (x & y) via:** https://en.wikipedia.org/wiki/Web_Mercator_projection <br/>
**Used Map from:** https://studio.mapbox.com/tilesets/ <br/>
**Brewer Palettes (coloring)** http://mkweb.bcgsc.ca/brewer/ <br/>
**Tectonic plates** https://github.com/fraxen/tectonicplates

## Installation

This is a [Node.js module](https://nodejs.org/en/) available through the [npm registry](https://www.npmjs.com/).
Before installing, **download and install Node.js**. Node.js 0.10 or higher is required.

Install dependencies:
```
$ npm install
```
Start local application:
```
$ node app.js
```

## Contributors

Niklas Heuer <br/>
Version: v0.6

## License

GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.
