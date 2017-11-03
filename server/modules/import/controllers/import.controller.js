'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Shop = mongoose.model('Shop'),
  FeedImport = require(path.resolve('./server/modules/import/lib/feed_import')),
  async = require('async');
  var XmlStream = require('xml-stream');


//todo store import list
//stop function
//socket
var feedImportList = new Map();

exports.test = function(req, res){
  Shop.find({}, (err, docs) =>{
    var testImport = new FeedImport(docs[0]);
    testImport.launchImport();
    res.json(testImport);
  
  });
};


exports.start = function (req, res) {
  var feedImport = req.import;
  feedImport.downloadFeed(function () {
    feedImport.startImport();
  });

  function sendError(error) {
    res.status(422).send({
      status: 'failed',
      message: error,
      time: Date.now
    });
    feedImport.importStreamFile.removeListener('data', sendStarted);
  }

  function sendStarted() {
    res.json({
      status: feedImport.state,
      message: 'download started',
      time: feedImport.downloadstartdate
    });
    feedImport.removeListener('httpError', sendError);
  }

  feedImport.once('httpError', sendError);
  feedImport.importStreamFile.once('data', sendStarted);
};

exports.pause = function (req, res) {
  var feedImport = req.import;

  if (feedImport.isPaused() != undefined && feedImport.isPaused()) {
    return res.json({
      status: feedImport.state,
      message: 'already paused or incorrect state'
    });
  }

  feedImport.pause();
  res.json({
    status: feedImport.state,
    message: 'paused'
  });
};

exports.resume = function (req, res) {
  var feedImport = req.import;
 
  if (feedImport.isPaused() != undefined && !feedImport.isPaused()) {
    return res.json({
      status: feedImport.state,
      message: 'already running or incorrect state'
    });
  }
  
  feedImport.resume();
  res.json({
    status: feedImport.state,
    message: 'resumed'
  });
};

exports.info = function (req, res) {
  var feedImport = req.import;
  res.json(feedImport.getInfo());
};

exports.list = function (req, res) {
  Shop.find().exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var result = [];
    for (var i = 0; i < shops.length; i++) {
      var feed = feedImportList.get(shops[i].id);
      if (!feed) {
        feed = new FeedImport(shops[i]);
      }
      //shops[i].import = feed.getInfo();
      result.push({
        shop: shops[i],
        import: feed.getInfo()
      });
    }
    res.json({
      items: result,
      count: shops.length
    });
  });
};

/**
 * Import middleware
 */
exports.importByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Import id is invalid'
    });
  }
  var feedImport = feedImportList.get(id);
  if (!feedImport) {
    return res.status(404).send({
      status: 'error',
      message: 'Import object not found'
    });
  }
  req.import = feedImport;
  next();
};



