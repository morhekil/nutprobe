var RSVP = require('rsvp');
var reqwest = require('reqwest');

reqwest({
  url: 'http://api.hostip.info/get_json.php',
  type: 'json',
  crossOrigin: true
}).then(function(json) {
  console.log('received', json);
}, function(error) {
  console.log('error', error);
});
