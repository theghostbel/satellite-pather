# satellite-pather
Build a path between two points on Earth using interconnection of low orbit satellites 

# How to use:

1. install node.js
2. place main.js and package.json somewhere
3. install required libs (package.json/dependencies) by running "npm i"
4. run script
   you can run it without params `node .\satpather.js`
   or add string containing params `node .\satpather.js novalidate-short` or `node .\satpather.js graph-short` 
5. possible params:
   `novalidate` - do not run server validation, for brave
   `graph` - show created graph object, for curious
   `short` - force distance between graph nodes to 1, for owners of small screens
   `fake` - use dumped CSV for same result every time (http request still works though), for consistency 
