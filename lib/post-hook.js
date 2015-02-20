require('rootpath')();
var exec      = require('child_process').exec;
var colors    = require('colors');


var postHook = module.exports = {
    run: function (target, results) {
        if (results && results.stats && results.stats.failures === 0) {
            console.log("running postHooks".white);
            process.chdir(target.projectRoot);
            exec('npm run post-hook', function (error, stdout, stderr) {
                if (error) {
                    out = "" + error;
                    console.log(out.red);
                } else {
                    console.log(stdout.white);
                }
            });
        } else {
            process.chdir(target.projectRoot);
        }
    }
}