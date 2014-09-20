var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");
var Q = require('q');
var dotenv = require('dotenv');
dotenv.load();

var ipgeo = require('./ipgeo');

var BATCH_SIZE = 4;

function connectToReports() {
  var tokenGenerator = new FirebaseTokenGenerator(process.env.FBIO_SECRET);
  var token = tokenGenerator.createToken({ uid: "1" });

  var reportsUrl = process.env.FBIO_REPORTS_URL;
  console.log('Accessing Firebase reports at ', reportsUrl);
  var reportsRef = new Firebase(reportsUrl);

  var auth = Q.defer();
  reportsRef.auth(token, function(error) {
    if (error) { console.log("Auth failed", error); auth.reject(error); }
    else { console.log("Auth success"); auth.resolve(reportsRef); }
  });

  return auth.promise;
}

function processItem(rid, report) {
  var res = Q.defer();
  var date = report.created_at.split('T')[0];
  whois.whois(report.ip, function(err, data) {
    console.log(date, report.ip, data);
    res.resolve();
  });
  return res.promise;
}

function processBatch(data) {
  var res = Q.defer();
  var lastId;
  var workers = [];

  data.forEach(function(item) {
    var rid = item.name();
    var report = item.val();
    // console.log(rid, report);
    lastId = rid;
    workers.push(processItem(rid, report));
  });

  Q.all(workers).then(function() { res.resolve(lastId); }).done();
  return res.promise;
}

function processReports(reportsdb) {
  var loadNextBatch = function(lastId) {
    if (!lastId) { process.exit(0); }
    processReports(reportsdb);
  };
  var processor = function(batch) { processBatch(batch).then(loadNextBatch).done(); }
  reportsdb.limit(BATCH_SIZE).once('value', processor);
}

connectToReports()
.then(function() { return ipgeo.lookup('203.55.215.252'); })
.then(function() { process.exit(0); })
.done();
// connectToReports().then(processReports);

// for (;;) {
//   var query = reports.limit(10);
//   query.once('value', function(report) {
//     var val = report.val();
//     if (val === null) { process.exit(0); }

//     console.log(val);
//     var date = val.created_at.split('T')[0];
//     whois.whois(val.ip, function(err, data) {
//       console.log(date, val.ip, data.Country);
//     });
//   });
// }
