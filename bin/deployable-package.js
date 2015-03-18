#!/usr/bin/env node

require('rootpath')();

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
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

var sourceDirectory, projectName, branch, commit, file, script, distProjectBranchDirectory;

sourceDirectory = process.env.npm_config_source_directory;
projectName = process.env.npm_config_project_name;
branch = process.env.npm_config_branch;
commit = process.env.npm_config_commit;
distDirectory = process.env.npm_config_dist_directory;


distProjectBranchDirectory = distDirectory + "/" + projectName + "/" + branch;

console.log("Creating dist/project/branch directory: " + distProjectBranchDirectory);
exec("mkdir -p " + distProjectBranchDirectory, function (error, stdout, stderr) {
    if (error) { 
        console.log(error);
        console.log(stderr);
        callback(error);
    } else {
        time = new Date().getTime();

        file        = distDirectory + "/" + projectName + "/" + branch + "/" + commit + "-" + time + ".tgz";
        linkToFile  = distDirectory + "/" + projectName + "/" + branch + "/current.tgz" 
        console.log("Creating deployable package at: " + file);

        tarCommand = spawn('tar', ['-czf', file, '-C', sourceDirectory, projectName]);

        tarCommand.stdout.on('data', function (data) {
            console.log(('' + data));
        });

        tarCommand.stderr.on('data', function (data) {
            console.log(('' + data));
        });

        tarCommand.on('close', function (code) {
            console.log('tar exit code ' + code);

            console.log('creating soft link for ' + file + " on " + linkToFile);
            var command = "ln -sf " + file + " " + linkToFile;
            console.log(command);
            exec(command, function (err, stdout, stderr) {
                console.log("finished soft link");
                if (err) console.log(err);
                console.log(stdout);
                console.log(stderr);                
            });

            process.exit(code);
            callback(null);
        });         
    }
});

