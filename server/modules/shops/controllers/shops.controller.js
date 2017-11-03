'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop'),
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
  Object.assign(shop, req.body);
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
exports.list = async(req, res) => {
  var sort = req.query._sort ? req.query._sort : config.pagination.default.sort;
  var page = req.query._page ? parseInt(req.query._page, 10) : config.pagination.default.page;
  var limit = req.query._limit ? parseInt(req.query._limit, 10) : config.pagination.default.limit;
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
    list.count = await Shop.count(query);
    if (list.count != 0) {
      list.items = await Shop.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec();
    }
    return res.json(list);
  } catch (e) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  }
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
    req.embeddedDoc = shop;
    next();
  });
};