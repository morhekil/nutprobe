#!/usr/bin/env node

var dotenv = require('dotenv');
dotenv.load();

var fb = require('../app/firebatch'),
    exporter = require('../app/locations.js');

fb.authenticate()
.then(function() { return exporter.csv(); })
.then(function(csv) { process.exit(0); })
.done();

