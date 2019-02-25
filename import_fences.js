var fences = require('./fences.json')
const Fence = require('./models/fence');

console.log(fences.features[0].geometry)

for (var i in fences.features) {
  title = fences.features[i].properties.nhood;
  geo_level = 1;
  geojson = fences.features[i].geometry;
  console.log(fences.features[i].properties.nhood);
  Fence.create({title: title, geo_level: geo_level, geojson: geojson});
}
