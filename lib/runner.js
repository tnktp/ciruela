require('rootpath')();
var colors 	= require('colors');
var exec 	= require('child_process').exec;
var mailer 	= require('lib/mailer');
var git 	= require('lib/git');
var jobs 	= require('lib/jobs');
var shellescape = require('shell-escape');

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
				git.fetch(target, function () {
					runCoverage(target, function () {
						runTask(target, function (success) {
							jobs.currentComplete(success, function () {
								runNextJob(target);
							});
						});
					});
				});
			} else {
				git.clone(target, function (){
					git.checkout(target, function () {
						git.fetch(target, function () {
							runCoverage(target, function () {
								runTask(target, function (success) {
									jobs.currentComplete(success, function () {
										runNextJob(target);
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

var runTask = function (target, callback) {
	jobs.updateJob(jobs.current, "Executing '" + git.runner + "'");
	exec(git.runner, { maxBuffer: 1024 * 1024 }, function(error, stdout, stderr){
		if (error) {
			jobs.updateJob(jobs.current, error, function() {
        		jobs.updateJob(jobs.current, stderr, function() {
          			jobs.updateJob(jobs.current, stdout, function() {
            			out = error || stderr;
						console.log(out.red);
						process.chdir(target.projectRoot);
						callback(false);
          			});
        		});
      		});
		} else {
			var results = JSON.parse(stdout);
			jobs.updateJob(jobs.current, results, function() {
				jobs.getAverageDuration(target, function (obj) {
					if (!obj) console.log("Did not found an average runtime".red)
					results['averageTime'] = obj.averageTime; 
					mailer.buildMail(target, results, function (builtResult) {
						mailer.sendBuildResult(buildResult);
						process.chdir(target.projectRoot);
						callback(true);
					});
				});
      		});
		}
	});	
};

var runCoverage = function (target, callback) {
	var output = ' HTML_FILE=' + shellescape([target.projectRoot]) + '/reports/' + shellescape([target.repoName]) + '.html';
	exec(git.coverage + '' + output, function (error, stdout, stderr) {
		console.log("Creating coverage file".white)
		callback();
	});
};
