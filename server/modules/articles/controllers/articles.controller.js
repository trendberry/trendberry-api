'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Create an article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var article = req.article ? req.article.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  article.isCurrentUserOwner = !!(req.user && article.user && article.user._id.toString() === req.user._id.toString());

  res.json(article);
};

/**
 * Update an article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  article.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  var sort = req.query.sort ? req.query.sort : '-created';
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  var limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;

  async.parallel([
    function (callback) {
      Article.count(function (err, count) {
        callback(err, count);
      });
    },
    function (callback) {
      Article.find().skip((page - 1) * limit).limit(limit).sort(sort).populate('user', 'displayName').exec(function (err, articles) {
        callback(err, articles);
      });
    }
  ],
  function (err, results) {
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
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
