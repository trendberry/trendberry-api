'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Create a Product
 */

exports.create = function (req, res) {
  var product = new Product(req.body);

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Show the current Product
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var product = req.product ? req.product.toJSON() : {};

  res.json(product);
};

/**
 * Update a Product
 */
exports.update = function (req, res) {
  var product = req.product;

  Object.assign(product, req.body);
  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Delete an Product
 */
exports.delete = function (req, res) {
  var product = req.product;

  product.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * List of Products
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
    list.count = await Product.count(query);
    if (list.count != 0) {
      list.items = await Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit).populate(['category', 'shop', 'vendor', {
        path: 'meta',
        select: '-document'
      }]).exec();
    }
    return res.json(list);
  } catch (e) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  }
};


/**
 * Product middleware
 */
exports.productByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Product is invalid'
    });
  }

  Product.findById(id).populate(['category', 'shop', 'vendor', 'meta']).exec(function (err, product) {
    if (err) {
      return next(err);
    } else if (!product) {
      return res.status(404).send({
        message: 'No Product with that identifier has been found'
      });
    }
    req.product = product;
    next();
  });
};