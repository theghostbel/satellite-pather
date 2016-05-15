const fetch = require('node-fetch')
const Cesium = require('cesium')
const dijkstrajs = require('dijkstrajs')
const buildUrl = require('build-url')

const EarthRadius = 6371 * 1000
const EarthShape = new Cesium.Ellipsoid(EarthRadius, EarthRadius, EarthRadius)
const EarthBoundary = new Cesium.BoundingSphere(new Cesium.Cartesian3(0, 0, 0), EarthRadius)

const latLonToXYZ = (latLon, alt) => Cesium.Cartesian3.fromDegrees(latLon.lon, latLon.lat, alt * 1000, EarthShape)
const createLatLon = (lat, lon) => ({lat: parseFloat(lat), lon: parseFloat(lon)})
const createStartEnd = (name, latLon) => ({
  name: name,
  xyz: Cesium.Cartesian3.fromDegrees(latLon.lon, latLon.lat, 1, EarthShape)
})
const lineIntersectsEarth = (lineStartXYZ, lineEndXYZ) => !!Cesium.IntersectionTests.lineSegmentSphere(
  lineStartXYZ, lineEndXYZ, EarthBoundary
)

fetch('https://space-fast-track.herokuapp.com/generate')
  .then(response => response.text())
  .then(csv => {
    if (hasDebug('fake')) csv = require('./fake-response.js')
    const csvRows = csv.split('\n')
    const seed = csvRows.shift().split(' ')[1]
    const routePoints = csvRows.pop().split(',')

    const routeStart = createStartEnd('START', createLatLon(routePoints[1], routePoints[2]))
    const routeEnd = createStartEnd('END', createLatLon(routePoints[3], routePoints[4]))

    const sats = csvRows
      .map(row => row.split(','))
      .map(satParams => ({
        name: satParams[0],
        xyz: latLonToXYZ(createLatLon(satParams[1], satParams[2]), parseFloat(satParams[3]))
      }))

    const allPoints = sats.concat(routeStart, routeEnd)
    var graph = {}
    allPoints.forEach(point => {
      graph[point.name] = {}
      const allPointsExceptCurrent = allPoints.filter(satCheck => satCheck != point)
      const pointsWithConnections = allPointsExceptCurrent
        .map(possibleConnectedPoint => {
          const hasDirectConnection = !lineIntersectsEarth(point.xyz, possibleConnectedPoint.xyz)
          const distance = hasDirectConnection
            ? parseInt(Cesium.Cartesian3.distance(point.xyz, possibleConnectedPoint.xyz), 10)
            : -1

          return Object.assign({}, possibleConnectedPoint, {
            directConnect: hasDirectConnection,
            distance: hasDebug('short') ? 1 : distance
          })
        })
        .filter(point => point.directConnect)

      pointsWithConnections.forEach(connectedPoint => {
        graph[point.name][connectedPoint.name] = connectedPoint.distance
      })
    })
    if (hasDebug('graph')) console.log(graph)
    const graphPath = dijkstrajs.find_path(graph, 'START', 'END')
    console.log('Seed:', seed)
    console.log('Route:', graphPath.join(','))

    if (!hasDebug('novalidate')) {
      const validateUrl = buildUrl('https://space-fast-track.herokuapp.com/check', {
        queryParams: {
          route: graphPath.slice(1, graphPath.length - 1).join(','),
          seed:  seed
        }
      })

      fetch(validateUrl)
        .then(response => response.text())
        .then(result => console.log('Check result:', result))
    }
  }).catch(error => console.log(error))

function hasDebug(key) { return process.argv.length > 2 && process.argv[2].includes(key) }

/*
How to:
1. install node.js
2. place main.js and package.json somewhere
3. install required libs (package.json/dependencies) by running "npm i"
4. run script
   you can run it without params "node .\satpather.js"
   or add string containing params "node .\satpather.js novalidate-short" or "node .\satpather.js graph-short" 
5. possible params:
   novalidate - do not run server validation, for brave
   graph - show created graph object, for curious
   short - force distance between graph nodes to 1, for owners of small screens
   fake - use dumped CSV for same result every time (http request still works though), for consistency 
 */
