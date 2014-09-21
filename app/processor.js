var dotenv = require('dotenv');
dotenv.load();

var Q = require('q'),
    Firebase = require('firebase'),
    ipgeo = require('./ipgeo'),
    fb = require('./firebatch'),
    whois = require('whois-ux')

function writeTick(keys, success) {
  var dfr = Q.defer();

  var key = keys.map(function(key) { return key.replace(/\W+/g, '-') }).join('/');
  var ref = new Firebase(
    [ process.env.FBIO_STATS_URL, key, success ? 'succ' : 'fail' ].join('/')
  );
  ref.transaction(
    function(val) { return val*1 + 1; },
    function(err) { err ? dfr.reject() : dfr.resolve() }
  );

  return dfr.promise;
}

function writeStat(report, geo) {
  var date = report.created_at.split('T')[0];
  var workers = [
    [date, report.target],
    [date, report.target, geo.country.code],
    [date, report.target, geo.country.code, 'ISP', geo.isp],
    [date, report.target, geo.country.code, 'CITY', geo.city],
    [date, report.target, geo.country.code, 'CITY', geo.city, geo.isp],
  ].map(function(keys) {
    return writeTick(keys, report.success);
  });

  return Q.all(workers);
}

function cleanupItem(rid) {
  return Q.Promise(function(resolve, reject) {
    var itemref = new Firebase(process.env.FBIO_REPORTS_URL + '/' + rid);
    itemref.remove();
    resolve();
  });
}

function processItem(rid, report) {
  var dfr = Q.defer();

  ipgeo.lookup(report.ip)
  .then(function(geo) {
          process.stdout.write('.');
          return writeStat(report, geo);
        },
       function(geoerr) {
         process.stderr.write("Geo ERR\t" + geoerr + "\t"+report.ip+"\n");
         return true;
       })
  .then(function() { return cleanupItem(rid); })
  .then(function() { dfr.resolve(); })
  .fail(function(err) { dfr.reject(err); })
  .done();

  return dfr.promise;
}

fb.authenticate()
.then(function() { return fb.run(process.env.BATCH_SIZE*1, processItem); } )
.then(function() { console.log("DONE"); process.exit(0); })
.done();
