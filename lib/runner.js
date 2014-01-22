require('rootpath')();
var colors 	= require('colors');
var exec 	= require('child_process').exec;
var mailer 	= require('lib/mailer');
var git 	= require('lib/git');
var jobs 	= require('lib/jobs');

runner = module.exports = {
	build: function (target) {
		runNextJob(target);
	}
};

runNextJob = function(target) {
	if (jobs.current) return false;
	jobs.next(function() {
		git.start(target, function(ready) {
			if (ready) {
				git.fetch(target, function () {
					runTask(target, function(success) {
						jobs.currentComplete(success, function () {
							runNextJob(target);
						});
					});
				});
			} else {
				git.clone(target, function (){
					git.checkout(target, function () {
						git.fetch(target, function () {
							runTask(target, function (success) {
								jobs.currentComplete(success, function () {
									runNextJob(target);
								});
							});
						});
					});
				});
			}
		});
	});
};

runTask = function (target, callback) {
	jobs.updateJob(jobs.current, "Executing '" + git.runner + "'");
	exec(git.runner, { maxBuffer: 1024 * 1024 }, function(error, stdout, stderr){
		if (error) {
			jobs.updateJob(jobs.current, error, function() {
        		jobs.updateJob(jobs.current, stderr, function() {
          			jobs.updateJob(jobs.current, stdout, function() {
            			out = error;
						console.log(out.red);
						process.chdir(target.projectRoot);
						callback(false);
          			});
        		});
      		});
		} else {
			results = JSON.parse(stdout);
			jobs.updateJob(jobs.current, results, function() {
				buildResult = {};
				buildResult['commit'] = target.commit;
				buildResult['branch'] = target.branch;
				buildResult['repoName'] = target.repoName;
				buildResult['duration'] = results.stats.duration;
				buildResult['totalTests'] = results.stats.tests;
				buildResult['failures'] = results.stats.failures || 0;
				buildResult['passes'] = results.stats.passes || 0;
				buildResult['pending'] = results.stats.pending || 0;
				buildResult['failureTitles'] = results.failures.map(function(failure){ return failure.fullTitle });
				mailer.sendBuildResult(buildResult);
				process.chdir(target.projectRoot);
				callback(true);
      		});
		}
	});	
};
