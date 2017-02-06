'use strict';

var validator = require('validator'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Send the server error 
 */
exports.sendServerError = function (req, res) {
 //res.status(500).send('Oops! Something went wrong...');
 res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Send the server not found responses
 */
exports.sendNotFound = function (req, res) {
  res.status(404).send('Path not found');
};
