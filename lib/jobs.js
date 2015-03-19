require('rootpath')();
var mongo   = require('mongodb');
var path    = require('path');
var async   = require('async');
var _       = require('lodash');
var git     = require('lib/git');
var colors  = require('colors');

var env = process.env.NODE_ENV || 'development';
var config = require('config/environments/'  + env + '.json');

var db = new mongo.Db("ciruela", new mongo.Server(config.mongo.host, config.mongo.port, {
    auto_reconnect: true
}), {});

db.open(function(error) {
    if (error) {
        console.log('There was an error creating a connection with the Mongo database. Please check that MongoDB is properly installed and running.'.red);
        return process.exit(1);
    }
});

ObjectID = mongo.BSONPure.ObjectID;

jobs = module.exports = {
  	
    current: null,

  	addJob: function (target, next) {
    	db.collection('jobs', function (error, collection) {
      		var job = {
                project: target.repoName,
                branch: target.branch,
                commit: target.commit,
                url: target.url,
                organization: target.organization,
                repoUrl: target.repoUrl,
                report: target.report,
        		addedTime: new Date().getTime(),
                log: {},
                duration: '',
        		running: false,
        		finished: false
      		};
      		
            collection.insert(job, function (error, result) {
                if (error) console.log(error);
                if (next) return next(job);
            });
    	});
  	},

    get: function(id, next) {
        db.collection('jobs', function (error, collection) {
            collection.findOne({ _id: new ObjectID(id) }, function (error, job) {
                if (job) {
                    return next(job);
                } else {
                    return next("No job found with the id '" + id + "'");
                }
            });
        });
    },

    getProjects: function (next) {
        return getAllProjects(next);
    },

    getAll: function (filter, next) {
        return getJobs(filter, next);
    },

    updateJob: function (id, results, next) {
        db.collection('jobs', function (error, collection) {
            collection.findOne({ _id: new ObjectID(id) }, function (error, job) {
                console.log(("Update log for job " + job._id).grey);
                if (!job) return false;
                job.log = (typeof results === 'object') ? results : {};
                if (results && results.stats && results.stats.duration ) {
                    job.duration = results.stats.duration;
                } else {
                    job.duration = 'X';
                }
                collection.save(job);
                if (next) {
                    return next();
                }
            });
        });
    },

    currentComplete: function (success, next) {
        console.log(("Job " + jobs.current + " Completed!").white)
        db.collection('jobs', function(error, collection) {
            collection.findOne({ _id: new ObjectID(jobs.current)}, function(error, job) {
                if (!job) return false;
                job.running = false;
                job.finished = true;
                job.failed = !success;
                job.finishedTime = new Date().getTime();
                jobs.current = null;
                collection.save(job);
                return next();
            });
        });
    },

    next: function(next) {
        db.collection('jobs', function(error, collection) {
            collection.findOne({ running: false, finished: false }, function (error, job) {
                if(error){
                    console.log(error);
                }
                if (!job) {
                    console.log("No next job");
                    return false;
                }
                job.running = true;
                job.startedTime = new Date().getTime();
                jobs.current = job._id.toString();
                var target = {
                    'branch': job.branch,
                    'url': job.url,
                    'organization': job.organization,
                    'repoUrl': job.repoUrl,
                    'repoName': job.project,
                    'commit': job.commit,
                    'report': job.report
                }
                collection.save(job);
                return next(target);
            });
        });
    },

    getAverageDuration: function (target, next) {
        db.collection('jobs', function (error, collection) {
            collection.aggregate({$match: {project: target.repoName}}, {$group: {_id: "$branch", averageTime: {$avg: "$duration"}}}, function (error, result) {
                if (!result) return next(false);
                obj = _.find(result, { '_id': target.branch });
                return next(obj);
            });
        });
    },

    compareDuration: function (averageTime, buildTime, next) {
        totalPercentage = ((buildTime/averageTime) - 1);
        if (totalPercentage < 0) {
            next(true, (Math.abs(totalPercentage)*100).toFixed(2));
        } else {
            next(false, (totalPercentage*100).toFixed(2));
        }
    },

    getPreviousJob: function (currentJob, next) {
        db.collection('jobs', function(error, collection) {
            collection.find({finishedTime: { $lt: new Date(currentJob.finishedTime).getTime()},
                            project: currentJob.project,
                            branch:currentJob.branch,
                            finished: true, failed: false },
                            {limit: 1, sort: {finishedTime: -1}})
            .toArray(function (err, lastJob) {
                if (lastJob && lastJob.length > 0) {
                    next(lastJob[0]);    
                } else {
                    next();
                };
            });
        });
    }
};


getJobs = function(filter, next) {
    return db.collection('jobs', function(error, collection) {
        if (filter) {
            collection.find(filter).sort({ addedTime: -1 })
            .toArray(function(error, results) {
                return next(results);
            });
        } else {
            collection.find().sort({ addedTime: -1 })
            .toArray(function (error, results) {
                if (error) {
                    console.log("Error on getting jobs".red)
                    console.log(error)
                    return next([]);
                };
                if (results) {
                    return next(_.uniq(results));
                }
            });
        }
    });
};

getAllProjects = function(next) {
    return db.collection('jobs', function(error, collection) {
        collection.find({}, {fields: {project: true}}).sort({ addedTime: -1 })
        .toArray(function (error, results) {
            if (error) {
                console.log("Error on getting projects".red)
                console.log(error)
                return next([]);
            };
            if (results) {
                return next(_.uniq(results));
            }
        });
    });
};
