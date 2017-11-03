'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Vendor = mongoose.model('Vendor'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Create a Vendor
 */
exports.create = function (req, res) {
  var vendor = new Vendor(req.body);

  vendor.save(function (err) {
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
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var vendor = req.vendor ? req.vendor.toJSON() : {};
  res.json(vendor);
};

/**
 * Update a Vendor
 */
exports.update = function (req, res) {
  var vendor = req.vendor;
  Object.assign(vendor, req.body);
  vendor.save(function (err) {
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
 * Delete an Vendor
 */
exports.delete = function (req, res) {
  var vendor = req.vendor;

  vendor.remove(function (err) {
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
 * List of Vendors
 */
exports.list = async(req, res) => {
  var sort = req.query._sort ? req.query._sort : config.pagination.default.sort;
  var page = req.query._page ? parseInt(req.query._page, 10) : config.pagination.default.page;
  var limit = req.query._limit ? parseInt(req.query._limit, 10) : config.pagination.default.limit;
  var query = {};
  if (req.query._order === 'DESC') {
    sort = '-' + sort;
  }
  var list = {
    count: 0,
    items: []
  };
  var query = {};
  if (req.query.q) {
    query.name = {
      '$regex': req.query.q,
      '$options': 'i'
    };
  };

  try {
    list.count = await Vendor.count(query);
    if (list.count != 0) {
      list.items = await Vendor.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec();
    }
    return res.json(list);
  } catch (e) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  }
};

/**
 * Vendor middleware
 */
exports.vendorByID = function (req, res, next, id) {

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