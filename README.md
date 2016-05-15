# satellite-pather
Build a path between two points on Earth using interconnection of low orbit satellites 

# How to use:

1. install node.js
2. place `satpather.js` and 'package.json` somewhere or just fork this repo
3. install required libs (package.json/dependencies) by running `npm i`
4. run script:
  1. you can run it without params `node .\satpather.js`
  2. or add string containing params `node .\satpather.js novalidate-short` or `node .\satpather.js graph-short` 
5. supported params:
  1. `novalidate` - do not run server validation, for brave
  2. `graph` - show created graph object, for curious
  3. `short` - force distance between graph nodes to 1, for owners of small screens
  4. `fake` - use dumped CSV for same result every time (http request still works though), for consistency 
  5. `render` - render satellites, Earth, stars, connection lines (not supported ever), for joke  
