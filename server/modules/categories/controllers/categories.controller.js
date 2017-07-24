'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Category = mongoose.model('Category'),
  async = require('async'),
  crypto = require('crypto');

/**
 * Create a Category
 */
exports.create = function (req, res) {
  var category = new Category(req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Show the current Category
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};

  res.json(category);
};

/**
 * Update a Category
 */
exports.update = function (req, res) {

  var category = req.category;

  category = Object.assign(category, req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Delete an Category
 */
exports.delete = function (req, res) {
  var category = req.category;

  category.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * List of Categories
 */
exports.list = function (req, res) {
  var sort = req.query._sort ? req.query._sort : config.pagination.default.sort;
  var page = req.query._page ? parseInt(req.query._page, 10) : config.pagination.default.page;
  var limit = req.query._limit ? parseInt(req.query._limit, 10) : config.pagination.default.limit;
  if (req.query._order === 'DESC') {
    sort = '-' + sort;
  }
  var query = {};
  if (req.query.q !== undefined) {
    query.name = {
      '$regex': req.query.q,
      '$options': 'i'
    };
  }

  if (req.query.parent !== undefined) {
    query.parent = req.query.parent ? new ObjectId(req.query.parent) : null;
  }

  async.series([function (callback) {
    Category.find(query).count(function (err, count) {
      if (count != 0) {
        callback(err, count);
      } else {
        callback(new Error('no categories found'), count);
      }
    });
  }, function (callback) {
    Category
      .aggregate()
      .match(query)
      .append({
        $graphLookup: {
          from: 'categories',
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'ancestors'
        }
      })
      .project({
        _id: 1,
        name: 1,
        description: 1,
        slug: 1,
        created: 1,
        parent: 1,
        ancestors: 1,
        picture: 1,
        path: {
          $concatArrays: [{
              $map: {
                input: '$ancestors',
                as: 'a',
                in: ['$$a.name', '$$a._id']
              }
            },
            [
              ['$name', '$_id']
            ]
          ]
        }
      }).sort(sort).skip((page - 1) * limit).limit(limit).exec(function (err, categories) {
        callback(err, categories);
      });

  }], function (err, results) {
    if (err) {
      if (err.message === 'no categories found') {
        res.setHeader('X-Total-Count', 0);
        return res.json({
          count: 0,
          items: []
        });
      }
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.setHeader('X-Total-Count', results[0]);
      res.json({
        count: results[0],
        items: results[1]
      });
    }
  });
};


/**
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Category is invalid'
    });
  }

  Category.findById(id).populate('parent').exec(function (err, category) {
    if (err) {
      return next(err);
    } else if (!category) {
      return res.status(404).send({
        message: 'No Category with that identifier has been found'
      });
    }
    req.category = category;
    next();
  });
};