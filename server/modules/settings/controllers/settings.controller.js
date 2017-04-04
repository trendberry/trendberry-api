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

  exports.create = function (req, res) {
  if (req.setting) {
    settings[req.setting] = req.body[req.setting];
    settings.save();
    res.send(settings[req.setting]);
  } else {
    Object.assign(settings, req.body);
    settings.save();
    res.json(settings);
  }
}


/**
 * Show the current Setting
 */
exports.read = function (req, res) {
  if (req.setting) {
    res.send(settings[req.setting]);
  } else {
    res.json(settings);
  }
};

/**
 * Update a Setting
 */
exports.update = function (req, res) {
  if (req.setting) {
    settings[setting] = req.body[setting];
    settings.save();
    res.send(settings[req.setting]);
  } else {
    Object.assign(settings, req.body);
    settings.save();
    res.json(settings);
  }
}


/**
 * Delete a Setting
 */
exports.delete = function (req, res) {
  var setting = req.setting;
  delete settings[setting];
  setting.save();
  res.send('setting deleted');
};

/**
 * Setting middleware
 */
exports.settingByID = function (req, res, next, id) {
  if (!settings[id]) {
    return res.status(404).send({
      message: 'No Setting with that key has been found'
    });
  }
  if (!req.body[id]){
    req.body[id] = settings[id];  
  }
  req.setting = id;
  next();
};