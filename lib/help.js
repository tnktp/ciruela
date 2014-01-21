require('rootpath')();
exec = require('child_process').exec;
colors = require('colors');
fs = require('fs');

help = module.exports = {

	prepare: function (target, callback) {
		fs.exists(target.name, function (exists) {
			if (exists) {
				process.chdir(target.name); // moved to ../projectRoot/tmp/clonedProject dir
				callback(true); // ready for fetch
			} else {
				console.log(("'" + target.repoName + "' does not exists, but not to worry... ").yellow);
				callback(false) // ready for cloning
			};
		});
	}
};