require('rootpath')();

var nodemailer      = require("nodemailer"),
    path            = require('path'),
    fs              = require('fs'),
    templatesDir    = path.resolve('.', 'views', 'mail'),
    emailTemplates  = require('email-templates');

exports.sendBuildResult = function (buildResult) {
    var env = process.env.NODE_ENV || 'production';

    var config = require('environments/' + env + '.json');

    emailTemplates(templatesDir, function(err, template) {
        if (err) console.error(err);

        // Create a SMTP transport object

        var transportOptions = {
            host: config.smtpOptions.host,
            port: config.smtpOptions.port // port for secure SMTP
        };

        if (config.smtpOptions.auth !== undefined ){
            transportOptions.auth = config.smtpOptions.auth;    
        };

        if ( config.smtpOptions.secureConnection ) {
            transportOptions.secureConnection = config.smtpOptions.secureConnection // use SSL
        };

        console.log('SMTP ready');

        var transport = nodemailer.createTransport("SMTP", transportOptions);

        // Render email vars
        // results = JSON.parse(stdout);
        // failures = results.stats.failures;
        // passes = results.stats.passes;
        // pending = results.stats.pending;
        // failureTitles = results.failures.map(function(failure){ return failure.fullTitle });
        var locals = {
                results: buildResult.results,
                failures: buildResult.failures,
                passes: buildResult.passes,
                pending: buildResult.pending,
                failureTitles: buildResult.failureTitles,
            };

        // Send a single email
        template('buildResult', locals, function(err, html, text) {
            if (err) console.error(err);
            transport.sendMail({
                from: config.smtpOptions.from, // sender address
                to: config.recipientList, // list of receivers
                subject: 'Build Report',
                html: html,
                alternatives: [{
                    contentType: "text/html; charset=UTF-8"
                }]
        }, function(err, responseStatus) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (responseStatus) {
                    console.log(responseStatus.message);
                    return;
                }
            });
        });
    });
}
