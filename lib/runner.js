require('rootpath')();
var colors 		= require('colors');
var exec 		= require('child_process').exec;
var mailer 		= require('lib/mailer');
var git 		= require('lib/git');
var jobs 		= require('lib/jobs');
var help 		= require('lib/help');
var fs 			= require('fs');

var runner = module.exports = {
	build: function (target) {
		runNextJob(target);
	}
};

var runNextJob = function(target) {
	if (jobs.current) return false;
	jobs.next(function() {
		git.start(target, function(ready) {
			if (ready) {
				git.checkout(target, function () {
					git.pull(target, function () {
						runCoverage(target, function () {
							runLint(target, function(lint_results) {
								runTask(target, lint_results, function (success) {
									jobs.currentComplete(success, function () {
										runNextJob(target);
									});
								});
							});
						});
					});
				});
			} else {
				git.clone(target, function (){
					git.checkout(target, function () {
						git.pull(target, function () {
							runCoverage(target, function () {
								runLint(target, function(lint_results) {
									runTask(target, lint_results, function (success) {
										jobs.currentComplete(success, function () {
											runNextJob(target);
										});
									});	
								});
							});
						});
					});
				});
			}
		});
	});
};

var runTask = function (target, lint_results, callback) {
	console.log("Running task");
	jobs.updateJob(jobs.current, "Executing '" + git.runner + "'");
	exec(git.runner, { maxBuffer: 1024 * 1024 }, function(error, stdout, stderr){
		results = JSON.parse(stdout);
		if (error) {
			jobs.updateJob(jobs.current, results, function() {	
				out = error || stderr;
				mailer.processError(out, lint_results, results, target);
				process.chdir(target.projectRoot);
				callback(false);
      		});
		} else {
			jobs.updateJob(jobs.current, results, function() {
				jobs.getAverageDuration(target, function (obj) {
					if (!obj) console.log("Did not found an average runtime".red)
					jobs.compareDuration(obj.averageTime, results.stats.duration, function (decrease, percentage) {
						results['decrease'] = decrease;
						results['decreasePercentage'] = percentage;
						mailer.buildMail(target, lint_results, results, function (builtResult) {
							mailer.sendBuildResult(builtResult);
						});
						process.chdir(target.projectRoot);
						callback(true);
					});
				});
      		});
		}
	});
};

var runCoverage = function (target, callback) {
	var output = ' HTML_FILE=' + target.projectRoot + '/reports/' + target.repoName + '.html';
	exec(git.coverage + '' + output, function (error, stdout, stderr) {
		console.log("Creating coverage file".white)
		callback();
	});
};

var runLint = function (target, callback) {
	console.log("Running JSHint".white)
	exec(git.lint, { maxBuffer: 1024 * 1024 }, function(error, stdout, stderr){
		results = stdout;
		callback(results);
	});
};
