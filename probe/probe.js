var RSVP = require('rsvp');
var j = require('140medley_j');

export default function(targets, expected, fbUrl, reportSuccess, cooldown) {
  // Get IP of the current machine via HostIP API.
  // Returns memoized promise, that resolves with the IP address string
  var getIP = function() {
    var ip_promise = null;

    return function() {
      if (ip_promise === null) {
        ip_promise = new RSVP.Promise(function(resolve, reject) {
          j.json('GET', 'http://api.hostip.info/get_json.php').then(
            function(hostip) { resolve(hostip.ip); }
          );
        });
      }
      return ip_promise;
    };
  }();

  // Load Firebase from their CDN.
  // Returns memoized promise, that resolves when the library is loaded
  var getFirebase = function() {
    var fbload = null;

    return function() {
      if (typeof Firebase === 'undefined' && fbload === null) {
        fbload = j.load('//cdn.firebase.com/js/client/1.0.17/firebase.js');
      }
      return fbload;
    };
  }();

  // Log status of the given target into Firebase.
  // Adds current timestamps to the report data, and an optional message string
  var logResult = function(target, status, msg) {
    RSVP.hash({
      firebase: getFirebase(),
      ip: getIP()
    }).then(function(r) {
      var fbref = new Firebase(fbUrl);
      var report = {
        target: target,
        ip: r.ip,
        success: status,
        message: msg || '',
        created_at: (new Date()).toISOString()
      };
      fbref.push(report);
    });
  };

  // Entry point for a target check. Fires off a request to
  var check = function(target) {
    try {
      j.request('GET', target).then(
        function(res) {
          if (res !== expected) { logResult(target, false, res); }
          else if (reportSuccess) { logResult(target, true); }
        },
        function(xhr) {
          logResult(target, false, (xhr.status + ' ' + xhr.statusText).trim());
        }
      );
    } catch(error) { logResult(target, false, error); }
  };

  // Initializes checks for all given targets
  if (!document.cookie.match('_nutprobed')) {
    var cookie = '_nutprobed=1; path=/';
    if (cooldown) { cookie += '; max-age='+3600*24*cooldown; }
    document.cookie = cookie;
    for (var i=0; i<targets.length; i++) { check(targets[i]); }
  }
}
