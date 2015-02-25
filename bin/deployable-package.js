#!/usr/bin/env node

require('rootpath')();

var spawn = require('child_process').spawn;
var winston = require('winston');

winston.remove(winston.transports.Console);

winston.add(winston.transports.File, {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    json: false,
    maxsize: 5242880, //5MB
    maxFiles: 5,
    colorize: false
});

var olog = console.log;
console.log = function () {
    winston.info(arguments[0]);
    olog.apply(console, arguments);
}

var project, branch, commit, directory, script;

project = process.env.npm_config_project;
branch = process.env.npm_config_branch;
commit = process.env.npm_config_commit;

time = new Date().getTime();

console.log("Creating deployable package for " + branch + "-" + commit + "-" + time + " on " + project);

directory = project + "-" + branch + "-" + commit + "-" + time;

tarCommand = spawn('tar', ['-cvzf', directory + ".tar.gz", project]);

tarCommand.stdout.on('data', function (data) {
    console.log(('' + data));
});

tarCommand.stderr.on('data', function (data) {
    console.log(('' + data));
});

tarCommand.on('close', function (code) {
    console.log('tar exit code ' + code);
    process.exit(code);
    callback(null);
});