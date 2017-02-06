'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  Vendor = mongoose.model('Vendor'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  _ = require('lodash');
  var fs = require('fs');

/**
 * Create a Vendor
 */
exports.create = function(req, res) {
  var vendor = new Vendor(req.body);

  vendor.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(vendor);
    }
  });
};

/**
 * Show the current Vendor
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var vendor = req.vendor ? req.vendor.toJSON() : {};

  res.jsonp(vendor);
};

/**
 * Update a Vendor
 */
exports.update = function(req, res) {
  var vendor = req.vendor;

  vendor = _.extend(vendor, req.body);

  vendor.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vendor);
    }
  });
};

/**
 * Delete an Vendor
 */
exports.delete = function(req, res) {
  var vendor = req.vendor;

  vendor.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vendor);
    }
  });
};

/**
 * List of Vendors
 */
exports.list = function(req, res) {

  async.parallel([function (callback) {
    Vendor.count(function (err, count) {
      callback(err, count);
    });
  }, function (callback) {
    Vendor.find().sort('-created').exec(function(err, vendors) {
      callback(err, vendors);
    });
  }], function (err, results) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        items: results[1],
        count: results[0]
      });
    }
  });
};
/**
 * Vendor middleware
 */
exports.vendorByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Vendor is invalid'
    });
  }

  Vendor.findById(id).exec(function (err, vendor) {
    if (err) {
      return next(err);
    } else if (!vendor) {
      return res.status(404).send({
        message: 'No Vendor with that identifier has been found'
      });
    }
    req.vendor = vendor;
    next();
  });
};
