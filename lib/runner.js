require('rootpath')();
var colors      = require('colors');
var exec        = require('child_process').exec;
var mailer      = require('lib/mailer');
var git         = require('lib/git');
var jobs        = require('lib/jobs');
var help        = require('lib/help');
var fs          = require('fs');
var postHook    = require('lib/post-hook');

var runner = module.exports = {
    build: function (target) {
        runNextJob(target);
    }
};

var runNextJob = function (target) {
    console.log("buiding target " + target.commit.id + " - " + target.commit.message);
    var runAllTaks = function () {
        console.log("Executing tasks".grey);
        git.fetch(function () {
            git.checkout(target, function() {
                git.pull(target, function() {
                    createDummySelfieKeys(target, function () {
                        runTask(target, function (test_results) {
                            runCoverage(target, function () {
                                runLint(target, function (lint_results) {
                                    processResults(target, test_results, lint_results, function (success) {
                                        jobs.currentComplete(success, function () {
                                            runNextJob(target);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });    
        });
    };
    
    if (jobs.current) {
        console.log("Current running job id: " + jobs.current);
        return false;
    }
    console.log("Running next job");
    jobs.next(function() {
        console.log("Starting job");
        git.start(target, function(ready) {
            if (ready) {
                runAllTaks();
            } else {
                git.clone(target, function() {
                    runAllTaks();
                });
            }
        });
    });
};

var runTask = function(target, callback) {
    console.log("Executing task".grey);
    process.chdir(target.name);
    jobs.updateJob(jobs.current, "Executing '" + git.runner + "'");
    exec(git.runner, {
        maxBuffer: 1024 * 1024
    }, function (error, stdout, stderr) {
        callback({
            error: error,
            stdout: stdout,
            stderr: stderr
        });
    });
};

var runCoverage = function (target, callback) {
    var output = ' HTML_FILE=' + target.projectRoot + '/reports/' + target.repoName + '.html';
    console.log("Creating coverage file".white);
    exec(git.coverage + '' + output, function (error, stdout, stderr) {
        callback();
    });
};

var runLint = function (target, callback) {
    console.log("Running JSHint".white);
    process.chdir(target.projectRoot);
    exec(git.lint({
        target: target
    }), {
        maxBuffer: 1024 * 1024
    }, function (error, stdout, stderr) {
        results = JSON.parse(stdout);
        process.chdir(target.name);
        callback(results);
    });
};

var processResults = function(target, tests, lint_results, callback) {
    console.log("Processing results".grey);
    if(tests.error) {
        console.log("Error - GIT Runner".red);
        console.log(tests.error);
        console.log("STDERR");
        console.log(tests.stderr);

        try {
            results = JSON.parse(tests.stdout);
        } catch(err) {
            console.log("Exception Error".red);
            console.log(err);
            results = {stats: {}};
        } finally {
            console.log("STDOUT");
            console.log(tests.stdout);
        }
        jobs.updateJob(jobs.current, results, function () {
            out = tests.error || tests.stderr;
            mailer.processError(out, lint_results, results, target);
            process.chdir(target.projectRoot);
            callback(false);
        });
    } else {
        console.log("Preparing report".grey);
        results = JSON.parse(tests.stdout);
        jobs.updateJob(jobs.current, results, function () {
            jobs.getAverageDuration(target, function (obj) {
                if (!obj) console.log("Did not found an average runtime".red)
                jobs.compareDuration(obj.averageTime, results.stats.duration, function (decrease, percentage) {
                    results['decrease'] = decrease;
                    results['decreasePercentage'] = percentage;
                    postHook.run(target, results);
                    mailer.buildMail(target, lint_results, results, function (builtResult) {
                        mailer.sendBuildResult(builtResult);
                    });
                    process.chdir(target.projectRoot);
                    callback(true);
                });
            });
        });
    }
}

var createDummySelfieKeys = function (target, callback) {
    console.log("Running createDummySelfieKeys".white);
    process.chdir(target.name);
    exec("mkdir -p selfie_keys", function (error, stdout, stderr) {
        process.chdir("selfie_keys");
        if (!error) {
            console.log("created selfie-keys folder".white);
            exec('echo "keyfile" > keyfile && echo "keyfile-a" > keyfile-a && echo "keyfile-b" > keyfile-b', function (error, stdout, stderr) {
                if (!error) {
                    console.log("created selfie-keys files".white);
                } else {
                    console.log(stderr.red);
                }
                return callback();
            })
        } else {
            console.log(stderr.red);
            return callback();
        }
    });
};
