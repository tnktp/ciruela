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

// development only
if ('development' == app.get('env')) {
  	app.use(express.errorHandler());
  	config = require('environments/development.json');
} else {
	config = require('environments/production.json');
}

app.post('/', function(req, res) {
	var data = JSON.parse(req.body.payload)
	var branch = data.ref.split('/')[2];
    var repoUrl = data.repository.url;
	var repoName = data.repository.name;
	var name = process.cwd() + '/tmp/' + data.repository.name;
	var targetUrl = 'git@github.com:' + data.repository.organization + '/' + data.repository.name
	var lastCommitInfo = data.commits[data.commits.length - 1];
	
	target = {	'branch': branch,
				'url': targetUrl,
				'name': name,
                'repoUrl': repoUrl,
                'repoName': repoName,
				'commit': lastCommitInfo,
				'projectRoot': process.cwd()
			};

	runner.build(target);
	res.send(200);

});


http.createServer(app).listen(app.get('port'), function(){
  console.log('ciruela server listening on port ' + app.get('port'));
});
