require('rootpath')();
var mongo = require('mongodb');
var path = require('path');

if ('development' == app.get('env')) {
  	app.use(express.errorHandler());
  	config = require('environments/development.json');
} else {
	config = require('environments/production.json');
}

setDb = function (target) {
	var db = new mongo.Db("ciruela_" + target.name, new mongo.Server(config.mongo.host, config.mongo.port, {
	  	auto_reconnect: true;
	}), {});


	db.open(function(error) {
	  	if (error) {
	    	console.log('There was an error creating a connection with the Mongo database. Please check that MongoDB is properly installed and running.'.red);
	    	return process.exit(1);
	  	}
	});

	ObjectID = mongo.BSONPure.ObjectID;
}

jobs = module.exports = {
  	current: null,

  	addJob: function(next) {
    	return db.collection('jobs', function(error, collection) {
      		var job = {
        		addedTime: new Date().getTime(),
        		log: '',
        		running: false,
        		finished: false
      		};

      		collection.insert(job);
      		if (next) {
        		return next(job);
      		}
    	});
  	}
};

