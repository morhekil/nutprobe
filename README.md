nutprobe
========

Client-side based URL availability testing tool. For a full description of the project, see [Visualising the censorship](http://speakmy.name/2014/09/28/visualising-the-censorship/) blog post.


How to use it
=============

Client-side probe
-----------------

`dist/assets/probe.statis.js` - compiled probe file, to be injected into client pages

Include the file on your pages, and send out the reports using the following snippet:

```html
<script type="text/javascript">
    try {
      var nutprobe = require('nutprobe/probe').default;
      var targets = [
        '//domain1.com/ping',
        '//domain2.com/ping',
        '//domain3.com/ping'
      ];
      var expected_answer = 'pong';
      var report_success = true;
      var cooldown_days = 1;
      nutprobe(targets, expected_answer,
               'https://yourname.firebaseio.com/reports',
               report_success, cooldown_days);
    } catch(e) {};
  </script>
```

where
* `targets` is the array of domain targets (URLs) to check,
* `expected_answer` is the correct answer that should be received when polling those URLs,
* `cooldown_days` is the number of days to wait until repeating the check for this client,
* `report_success` is whether to report successful checks, or failures only.

`yourname.firebaseio.com` should be changes to the name of your Firebase project that will host the report and processed data.

Processing reported data
------------------------

`bin/processor.js` - summary statistics generator
`bin/export.js` - export processed and summarised report data
`bin/locations.js` - export location geo coordinates

Once some samples have been collected by the client-side probe, the standard workflow is:

1. Post-process collected data: `./bin/processor.js`
2. Export a csv file with the summarised results: `./bin/export.js > domain-availability.csv`
3. Export a csv file with the location geo coordinates: `./bin/locations.js > locations.csv`
4. Reload data files in Tableau to rebuild the visualisation.


