'use strict';

var fs = require('fs'),
  path = require('path'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  crypto = require('crypto');

var multerConfig = {};
multerConfig.fileFilter = function (req, file, callback) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    var err = new Error();
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    return callback(err, false);
  }
  callback(null, true);
};
multerConfig.storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(config.uploads.pictures.temp.path))
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
});

module.exports = function (app, db) {
  //app.use(multer(multerConfig).single('picture'));
}