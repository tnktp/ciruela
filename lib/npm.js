require('rootpath')();
var spawn = require('child_process').spawn;
var colors = require('colors');

npm = module.exports = {

	clean: function(callback) {
		var out = "Cleaning cache!" // This is in order to avoid npm tar errors
		console.log(out.white);

		// var cmdUpdate = 'npm update'
		cmdInstall = spawn('npm', ['cache', 'clean']);

		cmdInstall.stdout.on('data', function (data) {
		  console.log(('' + data).grey);
		});

		cmdInstall.stderr.on('data', function (data) {
		  console.log(('' + data).red);
		});

		cmdInstall.on('close', function (code) {
		  	console.log(('npm clean exit code ' + code).cyan);		  
			callback();
		});
	},

	install: function (callback) {
		var out = "Installing project dependencies!"
		console.log(out.white);

		// var cmdUpdate = 'npm update'
		cmdInstall = spawn('npm', ['install']);

		cmdInstall.stdout.on('data', function (data) {
		  console.log(('' + data).grey);
		});

		cmdInstall.stderr.on('data', function (data) {
		  console.log(('' + data).red);
		});

		cmdInstall.on('close', function (code) {
		  	console.log(('npm install exit code ' + code).cyan);		  
			callback();
		});
	},

	update: function (callback) {
		var out = "Updating project dependencies!"
		console.log(out.white);

		// var cmdUpdate = 'npm update'
		cmdInstall = spawn('npm', ['update'])

		cmdInstall.stdout.on('data', function (data) {
		  console.log(('' + data).grey);
		});

		cmdInstall.stderr.on('data', function (data) {
		  console.log(('' + data).red);
		});

		cmdInstall.on('close', function (code) {
		  	console.log(('npm update exit code ' + code).cyan);		  
			callback();
		});	
	}
}