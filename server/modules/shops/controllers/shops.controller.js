'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop');
  //errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
//  _ = require('lodash');

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
  res.jsonp(shop);
};

/**
 * Update a Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;

  //shop = _.extend(shop, req.body);

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
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
  var sort = req.query.sort ? req.query.sort : '-created';
  // var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  //  var limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  Shop.find().sort(sort).exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        shops: shops,
        count: shops.length
      });
    }
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
