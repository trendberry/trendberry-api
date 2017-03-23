'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  // Setting = mongoose.model('Setting'),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Show the current Setting
 */
exports.read = function (req, res) {
  res.send(settings[req.setting]);
};

/**
 * Update a Setting
 */
exports.update = function (req, res) {
  var setting = req.setting;
  settings[setting] = req.body[setting];
  setting.save();
  res.json(settings);
};

/**
 * Delete a Setting
 */
exports.delete = function (req, res) {
  var setting = req.setting;
  delete settings[setting];
  setting.save();
  res.json(settings);
};

/**
 * List of Settings
 */
exports.list = function (req, res) {
  res.json(settings);
};

/**
 * Setting middleware
 */
exports.settingByID = function (req, res, next, id) {
  fs.readFile(path.resolve('./server/modules/settings/files/settings.json'), 'utf8', function (err, data) {
    if (err) {
      return next(err);
    }
    var settings = JSON.parse(data);
    if (!settings[id]) {
      return res.status(404).send({
        message: 'No Setting with that key has been found'
      });
    }
    req.setting = settings[id];
    next();
  });
};