var ipgeo = exports;

var geo = require('geoip2ws')(process.env.MAXMIND_UID, process.env.MAXMIND_KEY),
    Q = require('q'),
    Firebase = require('firebase');

function debug() {
  if (process.env.DEBUG) { console.log.apply(console, arguments); }
}

// Return Firebase cache ref for the given ip address
function ipCacheRef(ip) {
  var fbkey = ip.replace(/\./g, '-');
  var url = process.env.FBIO_GEOCACHE_URL + "/" + fbkey;
  return new Firebase(url);
}

// Read Firebase cache for the given ip address. Returns a promise, that
// resolves with an object {ip:, geo:}, where geo is null on cache miss,
// or cached value on cache hit.
//
// Rejects the promise on Firebase errors.
function readFirebase(ip) {
  debug("Firebase lookup", ip);
  var dfr = Q.defer();
  ipCacheRef(ip).once('value',
                      function(snap) { dfr.resolve({ ip: ip, geo: snap.val() }); },
                      function(error) { dfr.reject(error); }
                     );
  return dfr.promise;
}

// Write a cache value for the given geo location data and ip. Resolves
// the promise given as the last argument when the write is done, or rejects
// it on write errors.
function writeCache(ip, geodata, dfr) {
  debug("Saving cached ip", ip, geodata);
  ipCacheRef(ip).set(geodata, function(error) {
    if (error) { dfr.reject(error); }
    else { dfr.resolve(geodata); }
  });
}

// Extract a userful subset of data from the data hash received from Maxmind
function maxmindSubset(data) {
  return {
    country: { code: data.country.iso_code, name: data.country.names.en },
    location: data.location,
    city: data.city.names.en,
    continent: data.continent.names.en,
    domain: data.traits.domain,
    isp: data.traits.isp,
    isp_org: data.traits.autonomous_system_organization
  };
}

// Query Maxmind web service for geo location data
function queryMaxmind(lookup) {
  var dfr = Q.defer();
  // If we have a cached value - just resolve with it right away
  if (lookup.geo) {
    debug("MaxMind lookup skipped");
    dfr.resolve(lookup.geo);
    return dfr.promise;
  }

  // If we don't - do a lookup at Maxmind
  debug("MaxMind lookup", lookup.ip);
  geo(lookup.ip, function(err, geodata) {
    if (err) { dfr.reject(err); }
    else { writeCache(lookup.ip, maxmindSubset(geodata), dfr); }
  });
  return dfr.promise;
}

// Main API - perform a lookup of the given IP address.
// It checks Firebase cache first, and if the IP information is not there -
// queries Maxmind, and writes the value into the Firebase cache
ipgeo.lookup = function(ip) {
  return Q.Promise(function(resolve, reject) {
    readFirebase(ip)
    .then(queryMaxmind)
    .then(resolve, reject)
    .done();
  });
}
