require('rootpath')();

var nodemailer      = require("nodemailer"),
    path            = require('path'),
    fs              = require('fs'),
    templatesDir    = path.resolve('.', 'views', 'mail'),
    emailTemplates  = require('email-templates');
    colors          = require('colors')

mailer = module.exports = {

    sendBuildResult: function (buildResult) {
        var env = process.env.NODE_ENV || 'production';

        var config = require('environments/' + env + '.json');

        emailTemplates(templatesDir, function(err, template) {
            if (err) console.log(err.red);

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

            console.log(('SMTP ready').white);

            var transport = nodemailer.createTransport("SMTP", transportOptions);

            var locals = {
                    repoUrl: buildResult.repoUrl,
                    organization: buildResult.organization,
                    repoName: buildResult.repoName,
                    duration: buildResult.duration,
                    totalTests: buildResult.totalTests,
                    commit: buildResult.commit,
                    branch: buildResult.branch,
                    results: buildResult.results,
                    failures: buildResult.failures,
                    passes: buildResult.passes,
                    pending: buildResult.pending,
                    failureTitles: buildResult.failureTitles,
                };

            // Send a single email
            template(config.emailTemplateDir, locals, function(err, html, text) {
                if (err) console.log(err.red);
                // Subject: Success: org/repo [branch] by gitusername: i made some changes
                var subject = 'Success: ' + buildResult.organization + '/' + buildResult.repoName + ' [' + buildResult.branch + '] by ' + buildResult.commit.author.username + ': ' + buildResult.commit.message
                transport.sendMail({
                    from: config.smtpOptions.from, // sender address
                    to: config.recipientList, // list of receivers
                    subject: subject,
                    html: html,
                    alternatives: [{
                        contentType: "text/html; charset=UTF-8"
                    }]
            }, function(err, responseStatus) {
                    if (err) {
                        console.log(err.red);
                        return;
                    }
                    if (responseStatus) {
                        console.log((responseStatus.message).white);
                        return;
                    }
                });
            });
        });
    }
}