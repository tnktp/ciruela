require('rootpath')();
var colors    = require('colors');
var spawn     = require('child_process').spawn;

var postHook = module.exports = {
    createDeployablePackage: function (target, results, callback) {
        console.log("Running postHook for create deployable callback".white);
        process.chdir(target.projectRoot);
        if (results && results.stats && results.stats.tests === results.stats.passes && results.stats.failures === 0) {
            deployablePackageCommand = spawn('npm', ['run', 'deployable-package', '--project=' + target.name, '--branch=' + target.branch, '--commit=' + target.commit.id])

            deployablePackageCommand.stdout.on('data', function (data) {
                console.log(('' + data));
            });

            deployablePackageCommand.stderr.on('data', function (data) {
                console.log(('' + data));
            });

            deployablePackageCommand.on('close', function (code) {
                console.log('deployable-package exit code ' + code);
                callback(null);
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