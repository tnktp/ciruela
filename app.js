require('rootpath')();
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('routes');
var http = require('http');
var path = require('path');
var stylus = require('stylus');
var runner = require('lib/runner');
var jobs = require('lib/jobs');

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

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/reports", express.static(path.join(__dirname, 'reports')));

// development only
if ('development' == app.get('env')) {
  	app.use(express.errorHandler());
  	config = require('environments/development.json');
} else {
	config = require('environments/production.json');
}

app.post('/', function(req, res) {
	data = JSON.parse(req.body.payload)
	branch = data.ref.split('/')[2];
    repoUrl = data.repository.url;
	repoName = data.repository.name;
    organization = data.repository.organization;
	name = process.cwd() + '/tmp/' + data.repository.name;
	targetUrl = 'git@github.com:' + organization + '/' + repoName;
	lastCommitInfo = data.commits[data.commits.length - 1];
	report = config.server.root + ':' + config.server.port + '/reports/' + data.repository.name + '.html';
	
	target = {	
				'branch': branch,
				'url': targetUrl,
				'name': name,
                'organization': organization,
                'repoUrl': repoUrl,
                'repoName': repoName,
				'commit': lastCommitInfo,
				'projectRoot': process.cwd(),
				'report': report
			};


	jobs.addJob(target, function (job) {
		runner.build(target);
		res.json(200, job);
	});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('ciruela server listening on port ' + app.get('port'));
});
