'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));


/**
 * Create a Shop
 */
exports.create = function (req, res) {
  var shop = new Shop(req.body);

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * Show the current Shop
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shop = req.shop ? req.shop.toJSON() : {};
  res.json(shop);
};

/**
 * Update a Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;
  Object.assign(shop, req.body)
  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * Delete an Shop
 */
exports.delete = function (req, res) {
  var shop = req.shop;

  shop.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * List of Shops
 */
exports.list = function (req, res) {
  var sort = req.query._sort ? req.query._sort : config.pagination.default.sort;
  var page = req.query._page ? parseInt(req.query._page, 10) : config.pagination.default.page;
  var limit = req.query._limit ? parseInt(req.query._limit, 10) : config.pagination.default.limit;
  var query = {};
  if (req.query.name !== undefined) {
    query.name = {
      '$regex': req.query.name,
      '$options': 'i'
    };
  };

  async.series([
    function (callback) {
      Shop.find(query).count(function (err, count) {
        if (count != 0) {
          callback(err, count);
        } else {
          callback(new Error('no shops found'), count);
        }
      });
    },
    function (callback) {
      Shop.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec(function (err, shops) {
        callback(err, shops);
      });
    }
  ], function (err, results) {
    if (err) {
      if (err.message === 'no shops found') {
        res.setHeader('X-Total-Count', 0);
        return res.json(
          []
        );
      }
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.setHeader('X-Total-Count', results[0]);
    res.json(
      results[1]
    );
  });
};

/**
 * Shop middleware
 */
exports.shopByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shop is invalid'
    });
  }

  Shop.findById(id).exec(function (err, shop) {
    if (err) {
      return next(err);
    } else if (!shop) {
      return res.status(404).send({
        message: 'No Shop with that identifier has been found'
      });
    }
    req.shop = shop;
    next();
  });
};