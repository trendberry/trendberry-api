'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Setting = mongoose.model('Setting'),
  fs = require('fs'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

/**
 * Show the current Setting
 */
exports.read = function (req, res) {
  res.send(req.setting);
};

/**
 * Update a Setting
 */
exports.update = function (req, res) {
  var setting = req.setting;

  setting = _.extend(setting, req.body);

  setting.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(setting);
    }
  });
};

/**
 * Delete an Setting
 */
exports.delete = function (req, res) {
  var setting = req.setting;

  setting.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(setting);
    }
  });
};

/**
 * List of Settings
 */
exports.list = function (req, res) {
  // var settings = fs.readFileSync(path.resolve('./server/modules/settings/files/settings.json'));
  fs.readFileSync('hgh', function (err) {
    console.log(err);
  });


  res.send(settings);
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