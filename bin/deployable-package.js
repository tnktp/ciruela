#!/usr/bin/env node

require('rootpath')();
var spawn = require('child_process').spawn;

console.log("Creating deployable package for");

var project, branch, commit, directory, script;

project = process.env.npm_config_project;
branch = process.env.npm_config_branch;
commit = process.env.npm_config_commit;
time = new Date().getTime();

directory = project + "-" + branch + "-" + commit + "-" + time;

tarCommand = spawn('tar', ['-cvzf', directory + ".tar.gz", project]);

tarCommand.on('close', function (code) {
  	console.log('tar exit code ' + code);
});