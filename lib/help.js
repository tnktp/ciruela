require('rootpath')();
exec 		= require('child_process').exec;
colors 		= require('colors');
fs 			= require('fs');
path 		= require("path");


help = module.exports = {

	prepare: function (target, callback) {
		console.log("Preparing")
		process.chdir(target.projectRoot);
		console.log("Moved to: " + process.cwd());
		fs.exists(target.name, function (exists) {
			if (exists) {
				process.chdir(target.name); // moved to ../projectRoot/tmp/clonedProject dir
				console.log("Moved to: " + process.cwd());
				callback(true); // ready for fetch
			} else {
				console.log(("'" + target.repoName + "' does not exist, but not to worry... ").yellow);
				callback(false) // ready for cloning
			};
		});
	},

	rmdir: function (dir) {
		rmdir(dir);
	}
};

rmdir = function (dir) {
	var list = fs.readdirSync(dir);
	for ( var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		if(stat.isDirectory()) {
			// rmdir recursively
			help.rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};
