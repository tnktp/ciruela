require('rootpath')();
var exec = require('child_process').exec;
var colors = require('colors');
var npm = require('lib/npm');
var help = require('lib/help');
var readyCallback = null;
var shellescape = require('shell-escape');

var git = module.exports = {
	runner: 'make test-ciruela',
	coverage: 'make test-cov',
	branch: '',
	user: '',
	repoName:'',

	start: function(target, callback) {
	    help.prepare(target, function (prepared) {
	    	setBranch(target);
	    	setRepoName(target);
		    callback(prepared);
	    });
  	},

	fetch: function(target, callback) {
		exec('git fetch && git reset --hard ' + shellescape(['origin/' + git.branch]), function(error, stdout, stderr) {
			if (error != null) {
	  			out = "" + error;
	  			return console.log(out.red);
			} else {
				out = "Updating '" + git.branch + "' branch";
	  			console.log(out.white);
				npm.deploy(function() {
					return callback();
				});
			}
    	});
	},

	clone: function(target, callback) {
		var jobs, out;
		out = "Cloning '" + target.repoName + "' repository";
		console.log(out.white);
		
		var cmd = 'git clone ' + shellescape([target.url]) + ' ' + shellescape([target.name]);
    	exec(cmd, function(error, stdout, stderr){
			if (error) {
  				out = "" + error;
  				return console.log(out.red);
			} else {
				try {
					process.chdir(target.name);
					return callback();
				} catch (err) {
				  	console.log(err.red);
				}
			};
		});	
	},

	checkout: function (target, callback) {
		exec('git checkout ' + shellescape([target.branch]), function(error, stdout, stderr) {
			if (error) {
				return console.log(error.red);
			} else {
				npm.deploy(function (){
					return callback();
				});
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
		git.repoName = target.branch;
	}
  	return;
};