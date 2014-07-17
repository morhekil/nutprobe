define('140medley_j', ['rsvp'], function(RSVP) {
  var j = function(
    a // cursor placeholder
  ){
    for(                     // for all a
      a=0;                   // from 0
      a<4;                   // to 4,
      a++                    // incrementing
    ) try {                  // try
      return a               // returning
        ? new window.ActiveXObject( // a new ActiveXObject
            [                // reflecting
              ,              // (elided)
              "Msxml2",      // the various
              "Msxml3",      // working
              "Microsoft"    // options
            ][a] +           // for Microsoft implementations, and
            ".XMLHTTP"       // the appropriate suffix,
          )                  // but make sure to
        : new window.XMLHttpRequest // try the w3c standard first, and
    }

    catch(e){}               // ignore when it fails.
  };

  var request = function(method, url, config) {
    var promise = new RSVP.Promise(function(resolve, reject){
      var client = new XMLHttpRequest();
      if (typeof config !== 'undefined') { config(client); }
      client.open(method, url);
      client.onreadystatechange = handler;
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { resolve(this.response); }
          else { reject(this); }
        }
      }
    });

    return promise;
  };

  var json = function(method, url) {
    return request(method, url, function(client) {
      client.responseType = "json";
    });
  };

  var load = function (url){
    return new RSVP.Promise(function(resolve, reject) {
      var script = document.createElement("script");
      script.type = "text/javascript";

      if (script.readyState){  //IE
        script.onreadystatechange = function(){
          if (script.readyState === "loaded" ||
              script.readyState === "complete"){
            script.onreadystatechange = null;
          resolve(true);
          }
        };
      } else {  //Others
        script.onload = function() { resolve(true); };
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  };

  return { xhr: j, request: request, load: load, json: json };
});
