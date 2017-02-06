'use strict';

var config = require('../config'),
  mongoose = require('mongoose');

module.exports.connect = function (callback) {
  mongoose.Promise = global.Promise;
  var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
    if (err) {
      console.log('DB connection error');
      console.log(err);
    } else {
      console.log('Connected to DB');
      if (callback) {
        callback(db);
      }
    }
  })
};

module.exports.disconnect = function (callback) {
  mongoose.disconnect(function (err) {
    console.log('Disconnected from DB');
    callback(err);
  });
};