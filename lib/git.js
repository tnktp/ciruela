require('rootpath')();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var colors = require('colors');
var npm = require('lib/npm');
var help = require('lib/help');
var readyCallback = null;

var git = module.exports = {
	lint: 'make lint',
	runner: 'make test-ciruela',
	coverage: 'make test-cov',
	branch: '',
	user: '',
	repoName: '',

	start: function(target, callback) {
	    help.prepare(target, function (prepared) {
	    	setBranch(target);
	    	setRepoName(target);
		    callback(prepared);
	    });
  	},

	pull: function(target, callback) {
		exec('git reset --hard HEAD && ' + 'git pull origin ' + git.branch, function(error, stdout, stderr) {
			if (error) {
	  			out = "" + error;
	  			return console.log(out.red);
			} else {
				out = "Updating '" + git.branch + "' branch";
	  			console.log(out.white);
				npm.deploy(function() {
					npm.update(function () {
						return callback();
					});
				});
			}
    	});
	},

	clone: function(target, callback) {
		var jobs, out;
		out = "Cloning '" + git.repoName + "' repository";
		console.log(out.white);
		var gitclone = spawn('git', ['clone', target.url, target.name])

		gitclone.stdout.on('data', function (data) {
		 	console.log(('' + data).grey);
		});

		gitclone.stderr.on('data', function (data) {
		 	console.log(('' + data).grey);
		});

		gitclone.on('close', function (code) {
		  	console.log(('git clone exit code ' + code).cyan);
		  	process.chdir(target.name);		  
			callback();
		});
	},

	checkout: function (target, callback) {
		exec('git reset --hard HEAD && ' + 'git checkout ' + target.branch, function(error, stdout, stderr) {
			if (error) {
				return console.log(error.red);
			} else {
				return callback();
			}
		});	
	}
};

var setBranch = function(target) {
	if (target.branch === "" || target.branch === undefined) {
		git.branch = 'master';
	} else {
		git.branch = target.branch;
	}
  	return;
};

var setRepoName = function(target) {
	if (target.repoName === "" || target.repoName === undefined) {
		console.log(("Repository name not found, will give 'generic' name!").yellow)
		git.repoName = 'generic';
	} else {
		git.repoName = target.repoName;
	}
  	return;
};
