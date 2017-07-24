'use strict';


var path = require('path'),
  mongoose = require('mongoose'),
  // Setting = mongoose.model('Setting'),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

exports.create = function (req, res) {
  res.json(settings.renew(req.body));
}

exports.read = function (req, res) {
  res.json(settings);
};

exports.update = function (req, res) {
  res.json(settings.update(req.body));
}