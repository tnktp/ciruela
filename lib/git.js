require('rootpath')();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var colors = require('colors');
var npm = require('lib/npm');
var help = require('lib/help');
var readyCallback = null;

var git = module.exports = {
	lint: function (options) {
		var _jshint_command, target, project_path;
		target = options.target;
		project_path = target.name;
		_jshint_command = "jshint " + project_path + "/* --exclude-path=.jshintignore --reporter=lib/reporter.js";
		return _jshint_command;
	},
	runner: 'make test-ciruela --silent --ignore-errors --no-print-directory',
	coverage: 'make test-cov-ciruela --silent --ignore-errors --no-print-directory',
	branch: '',
	user: '',
	repoName: '',

	start: function (target, callback) {
		target.projectRoot = process.cwd();
		console.log("Setting project root for target: " + target.projectRoot);
		target.name = target.projectRoot + '/tmp/' + target.repoName;
		console.log("Setting name for target: " + target.name);
		help.prepare(target, function (prepared) {
			callback(target, prepared);
		});
  	},

	// pull: function(target, callback) {
	// 	console.log("Executing pull".grey);
	// 	exec('git reset --hard HEAD && ' + 'git pull origin ' + git.branch, function (error, stdout, stderr) {
	// 		if (error) {
	// 			jobs.current = null;
	//   			out = "" + error;
	//   			return console.log(out.red);
	// 		} else {
	// 			out = "Updating '" + git.branch + "' branch";
	//   			console.log(out.white);
	//   			// npm.clean(function () {
	//   				npm.deploy(function () {
	// 					//npm.update(function () {
	// 						return callback();
	// 					//});
	// 				});	
	//   			// });
	// 		}
 //    	});
	// },

	clone: function(target, callback) {
		var jobs, out;
		out = "Cloning '" + target.repoName + "' repository";
		console.log(out.white);
		var gitclone = spawn('git', ['clone', target.url, target.name]);

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

	fetch: function (target, callback) {
		console.log(("Executing fetch on " + target.repoName + " repository").grey);
		exec('git reset --hard && git fetch', function (error, stdout, stderr) {
			if (error) {
				return console.log((stderr).red);
			} else {
				return callback();
			}
		});	
	},

	checkout: function (target, callback) {
		console.log(("Executing checkout " + target.branch + " " + target.commit.id).grey);
		exec('git checkout ' + target.branch + ' && git reset --hard ' + target.commit.id, function (error, stdout, stderr) {
			if (error) {
				return console.log((stderr).red);
			} else {
				return callback();
			}
		});	
	}
};

