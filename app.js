require('rootpath')();
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('routes');
var http = require('http');
var path = require('path');
var stylus = require('stylus');
var fs = require('fs');
var async = require('async');
var mailer = require('lib/mailer');
var exec = require('child_process').exec;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(stylus.middleware({
	debug: false,
	src: __dirname + '/views',
	dest: __dirname + '/public',
    compile: function(str) {
        return stylus(str).set('compress', true);
    }
}));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  	app.use(express.errorHandler());
}

app.post('/', function(req, res) {
	var data = JSON.parse(req.body.payload)
	var branch = data.ref.split('/')[2];
	var target = data.repository.name;
	var targetUrl = 'git@github.com:' + data.repository.organization + '/' + data.repository.name

	async.waterfall([
			function (w_cb) {
				fs.exists('../' + target, function(exists) {
			        if (exists) {
						process.chdir('../' + target);
						var cmd = 'git fetch && git reset --hard origin/' + branch + ' && npm install';
						exec(cmd, function(error, stdout, stderr){
							console.log("STDErr " + stderr)
							console.log("Err " + error);
							console.log("STDOUT 0: " + stdout);
							w_cb(null, cmd);
						});
			        } else {
			        	process.chdir('../');
			        	var cmd = 'git clone ' + targetUrl + '.git';
			        	exec(cmd, function(error, stdout, stderr){
							console.log("STDOUT 1: " + stdout);
							process.chdir(target);
							exec('git checkout ' + branch + ' && npm install', function(error, stdout, stderr) {
								console.log("STDErr " + stderr)
								console.log("Err " + error);	
								console.log("STDOUT 2: " + stdout);
								w_cb(null);
							})
						});
			        };
		      	});
			},

			function (w_cb) {
				exec('make test-ciruela', function(error, stdout, stderr){
					buildResult = {};	
					results = JSON.parse(stdout);
					buildResult['failures'] = results.stats.failures;
					buildResult['passes'] = results.stats.passes;
					buildResult['pending'] = results.stats.pending;
					buildResult['failureTitles'] = results.failures.map(function(failure){ return failure.fullTitle });
					mailer.sendBuildResult(buildResult);
				});
			}
		],

		function (err, result) {
			if (err) console.log(err);
			res.send('200', {message: 'Repo will be tested'});
		}
	);
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
