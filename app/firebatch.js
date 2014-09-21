var firebatch = exports;

var Firebase = require('firebase'),
    FirebaseTokenGenerator = require("firebase-token-generator"),
    Q = require('q'),
    debug = require('./debug');

function reportsRef() {
  var reportsUrl = process.env.FBIO_REPORTS_URL;
  var reportsRef = new Firebase(reportsUrl);
  return reportsRef;
}

// Authenticate with Firebase service
firebatch.authenticate = function() {
  var tokenGenerator = new FirebaseTokenGenerator(process.env.FBIO_SECRET);
  var token = tokenGenerator.createToken({ uid: "1" });

  debug('Authenticating with Firebase');

  var auth = Q.defer();
  reportsRef().auth(token, function(error) {
    if (error) { debug("Auth failed", error); auth.reject(error); }
    else { debug("Auth success"); auth.resolve(reportsRef); }
  });

  return auth.promise;
}

function processBatch(data, callback) {
  var work = Q.defer();
  var workers = [];

  data.forEach(function(item) {
    var rid = item.name();
    var report = item.val();
    workers.push(callback(rid, report));
  });

  if (workers.length > 0) {
    Q.all(workers).then(function() { work.resolve(true); }).done();
  } else {
    work.resolve(false);
  }
  return work.promise;
}

function loadBatch(fbio, batchSize, callback, dfr) {
  if (!dfr) { dfr = Q.defer(); }

  fbio.limit(batchSize).once(
    'value',
    function(data) {
      processBatch(data, callback).then(function(moreData) {
        if (moreData) { return loadBatch(fbio, batchSize, callback, dfr); }
        else { dfr.resolve(); }
      });
    },
    function(error) { dfr.reject(error); }
  );

  return dfr.promise;
}

// Runs the Firebase data queue in batches of the given size, passing
// every item to the provided callback function.
//
// Callback function receives report id and report value as parameters,
// and it should return a promise, and resolve it when it's done
// with its work.
firebatch.run = function(batchSize, callback) {
  var fbio = reportsRef();
  return loadBatch(fbio, batchSize, callback);
}
