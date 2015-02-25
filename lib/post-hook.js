require('rootpath')();
var exec      = require('child_process').exec;
var colors    = require('colors');
var spawn     = require('child_process').spawn;

var postHook = module.exports = {
    createDeployablePackage: function (target, results, callback) {
        console.log("Running postHook for create deployable callback".white);
        process.chdir(target.projectRoot);
        if (results && results.stats && results.stats.tests === results.stats.passes && results.stats.failures === 0) {
            var script = 'npm run deployable-package --project=' + target.name +  ' --branch=' + target.branch + ' --commit=' + target.commit.id;
            
            exec(script, {maxBuffer: 1024 * 1024}, function (error, stdout, stderr) {
                if (error) {
                    out = "" + error;
                    console.log(out.red);
                    console.log(stderr);
                } else {
                    console.log(stdout.white);
                }
                console.log("deployable-package finished!");
                callback(error, stdout, stderr);
            });
        } else {
            console.log("Error: Deployable package not created".yellow);
            console.log(("Tests: " + results.stats.tests).yellow);
            console.log(("Tests passes: " + results.stats.passes).yellow);
            console.log(("Tests failures: " + results.stats.failures).yellow);
            callback("Error: Deployable package not created");
        }
    }
}