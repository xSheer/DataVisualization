
# Data visualization of earthquakes from U.S. Geological Survey & GeoJson.

## Overview
This project visualizes earthquakes and urban cities around the globe. To achieve this different 
virtualization methods are used.

1. Earthquakes got visualized as points with different sizes depending on their maginute. (Zoom level 7+)
2. Heatmap for regions with high levels of earthquakes got colored via *Brewer Palette* (Zoom level 0+)
3. Position of *ISS* live (refreshed every secound) via rocket-symbol

Option
1. Button urban
2. Button earthquakes (vielleicht magniatude auswählbar)
3. Button toFly ISS

## Data
  
**Earthquake data from:** https://earthquake.usgs.gov/earthquakes/search/ <br/>
**GeoJson data from:** https://d2ad6b4ur7yvpq.cloudfront.net/ <br/>
**Map projection (x & y) via:** https://en.wikipedia.org/wiki/Web_Mercator_projection <br/>
**Used Map from:** https://studio.mapbox.com/tilesets/ <br/>
**BREWER PALETTES** http://mkweb.bcgsc.ca/brewer/


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
Version: v0.2

## License

GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.
