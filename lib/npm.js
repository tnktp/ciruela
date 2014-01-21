require('rootpath')();
var exec = require('child_process').exec;
var colors = require('colors');

npm = module.exports = {
	deploy: function (callback) {
		var out = "Installing project dependencies!"
		console.log(out.grey);
		var cmd = 'npm install && npm update'
		exec(cmd, function (err, stdout, stderr) {
			if (err) {
				console.log(err.red);
			} else {
				callback();
			}
		});
	}
}