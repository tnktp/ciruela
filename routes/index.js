require('rootpath')();
var jobs = require('lib/jobs');
var _ = require('lodash');
var async = require('async');
var colors = require('colors');
/*
 * GET home page.
 */

exports.index = function(req, res){
	jobs.getProjects(function (results) {
		res.render('index', { title: "Ciruela", results: results, projectName: undefined});
	});
};

exports.projectJobs = function(req, res){
	filter = {project: req.params.projectName};

	jobs.getAll(filter, function (results) {
		res.render('projectJobs', { title: "Ciruela", results: results, projectName: req.params.projectName});
	});
};

exports.projectJobsbyBranch = function(req, res){

	filter = {project: req.params.projectName, branch: req.params.branchName};

	jobs.getAll(filter, function (results) {
		if (results && results.length > 0) {
			results = results;
		}
		res.render('projectJobsbyBranch', { title: "Ciruela", results: results, projectName: req.params.projectName, branchName: req.params.branchName});
	});
};

exports.getJob = function(req, res){
	var id = req.params.jobId
	var comparison;
	jobs.get(id, function (job) {
		if (job instanceof String) {
			job = null;
			prevJob = null;
			res.render('job', { title: 'Ciruela', job: job, comparison: null, comparisonKeys: null});
		} else {
			if (!job.failed && job.log.stats !== undefined && job.log.stats.passes > 0) {
				jobs.getPreviousJob(job, function (prevJob){
					if (prevJob && prevJob.log && prevJob.log.passes.length > 0) {
						comparison = {};
						async.eachSeries(job.log.passes, function (jobPass, each_cb){
							comparison[jobPass.fullTitle] = {};
							comparison[jobPass.fullTitle]['currentTime'] = jobPass.duration;
							comparison[jobPass.fullTitle]['prevTest'] = _.find(prevJob.log.passes, function (prevPass) {return prevPass.fullTitle == jobPass.fullTitle});
							each_cb();
						}, function (err){
							if (err) console.log(err);
							res.render('job', { title: 'Ciruela', job: job, comparison: comparison, comparisonKeys: Object.keys(comparison)});
						});
					} else {
						res.render('job', { title: 'Ciruela', job: job, comparison: comparison, comparisonKeys: null});
					}
				});
			} else {
				res.render('job', { title: 'Ciruela', job: job, comparison: comparison, comparisonKeys: null});
			}
		}

	});
};