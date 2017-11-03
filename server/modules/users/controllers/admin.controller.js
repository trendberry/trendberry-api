'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  // For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
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
  };

  async.series([
    function (callback) {
      User.find(query).count(function (err, count) {
        if (count != 0) {
          callback(err, count);
        } else {
          callback(new Error('no products found'), count);
        }
      });
    },
    function (callback) {
      User.find(query).sort(sort).skip((page - 1) * limit).limit(limit).populate(['category', 'shop', 'vendor']).exec(function (err, products) {
        callback(err, products);
      });
    }
  ], function (err, results) {
    if (err) {
      if (err.message === 'no products found') {
        res.setHeader('X-Total-Count', 0);
        return res.json({
          count: 0,
          items: []
        });
      }
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.setHeader('X-Total-Count', results[0]);
    res.json({
      count: results[0],
      items: results[1]
    });
  }); 
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password -providerData').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};
