require('rootpath')();
var exec = require('child_process').exec;
var colors = require('colors');

npm = module.exports = {
	deploy: function (callback) {
		var out = "Installing project dependencies!"
		console.log(out.white);
		var cmdInstall = 'npm install'
		var cmdUpdate = 'npm update'
		exec(cmdInstall, function (err, stdout, stderr) {
			if (err) console.log(err.red);
			if (stdout) {
				exec(cmdUpdate, function (err, stdout, stderr) {
					if (err) console.log(err.red);
					if (stdout) {
						callback();
					}
				});
			}
		});
	}
}