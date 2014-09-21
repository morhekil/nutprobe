#!/usr/bin/env node

var dotenv = require('dotenv');
dotenv.load();

var fb = require('../app/firebatch'),
    summarize = require('../app/summarize.js');

fb.authenticate()
.then(function() { return fb.run(process.env.BATCH_SIZE*1, summarize.item); } )
.then(function() { process.exit(0); })
.done();
