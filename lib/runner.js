require('rootpath')();
var mailer = require('lib/mailer');
var git = require('lib/git');
var colors = require('colors');
var exec = require('child_process').exec;

runner = module.exports = {
	build: function (target) {
		git.start(target, function(ready) {
			if (ready) {
				git.fetch(target, function () {
					runTask(target);
				});
			} else {
				git.clone(target, function (){
					git.checkout(target, function () {
						git.fetch(target, function (){
							runTask(target);
						});
					});
				});
			}
		});	
	}
};

runTask = function (target) {
	exec(git.runner, function(error, stdout, stderr){
		if (error) {
			out = error;
			return console.log(out.red);
		} else {
			buildResult = {};
			results = JSON.parse(stdout);
			buildResult['branch'] = target.branch;
			buildResult['repoUrl'] = target.repoUrl;
			buildResult['repoName'] = target.repoName;
			buildResult['commit'] = target.commit;
			buildResult['failures'] = results.stats.failures || 0;
			buildResult['passes'] = results.stats.passes || 0;
			buildResult['pending'] = results.stats.pending || 0;
			buildResult['failureTitles'] = results.failures.map(function(failure){ return failure.fullTitle });
			mailer.sendBuildResult(buildResult);
			process.chdir(target.projectRoot)
		}
	});	
};
