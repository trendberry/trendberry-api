'use strict';


var path = require('path'),
  mongoose = require('mongoose'),
  // Setting = mongoose.model('Setting'),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

exports.create = function (req, res) {
  try {
    settings = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).send(errorHandler.getErrorMessage(e));
  }
  res.json(settings);
}

exports.read = function (req, res) {
  res.json(settings);
};

exports.update = function (req, res) {
  try {
    Object.assign(settings, JSON.parse(req.body));
  } catch (e) {
    return res.status(400).send(errorHandler.getErrorMessage(e));
  }
  res.json(settings);
}