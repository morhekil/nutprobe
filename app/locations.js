var Firebase = require('firebase'),
    Q = require('q'),
    debug = require('./debug');

var cities = { NA: true };

// Retrieve a snapshot of current statistics from Firebase
function getSnapshot() {
  return Q.Promise(function(resolve, reject) {
    debug("Retrieving snapshot", process.env.FBIO_GEOCACHE_URL);
    var ref = new Firebase(process.env.FBIO_GEOCACHE_URL);
    ref.once('value', resolve, reject);
  });
}

// Export data from the given node
function exportNode(node) {
  var val = node.val();
  if (!cities[val.city]) {
    cities[val.city] = true;
    process.stdout.write([
      val.city, val.location.latitude, val.location.longitude
    ].join(',') + "\n");
  }
}

// Export received snapshot as csv data
function exportData(snap) {
  process.stdout.write("City,Latitude,Longitude\n");
  snap.forEach(exportNode);
}

function csv() {
  return getSnapshot().then(exportData);
}

module.exports = {
  csv: csv
}

