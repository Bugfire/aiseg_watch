#!/usr/bin/env node

function kick() {
    var proc = require('child_process').spawn('./aiseg_watch.js');
    proc.stdout.on('data', function(data) {
        process.stdout.write(data);
    });
    proc.stderr.on('data', function(data) {
        process.stdout.write(data);
    });
    proc.once('error', function() {
        process.stdout.write('error.');
    });
    proc.once('close', function() {
        process.stdout.write('close.');
    });
    proc.once('exit', function() {
        process.stdout.write('exit.');
    });
};

var CronJob = require('cron').CronJob;
new CronJob('* * * * *', kick, null, true);
