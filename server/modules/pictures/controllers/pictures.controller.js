'use strict';

var fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  crypto = require('crypto'),
  plugedModels = [];




mongoose.modelNames().forEach(function (modelName) {
  var model = mongoose.model(modelName);
  var pictPath = model.schema.path('picture');
  if (pictPath) {
    if (pictPath.schema.path('name') && pictPath.schema.path('color') && pictPath.schema.path('order')) {
      plugedModels.push(model);
    }
  }
});



var multerConfig = {};
multerConfig.fileFilter = function (req, file, callback) {
  console.log('sdfg')
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    var err = new Error();
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    return callback(err, false);
  }
  callback(null, true);
};
 multerConfig.storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('d')
    cb(null, config.uploads.pictures.temp.path)
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      console.log('dd')
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname))

    })
  }
});

//multerConfig.dest = config.uploads.pictures.temp.path;
multerConfig.limits = {
  fileSize: 1 * 1024 * 1024
}

exports.uploadPicture = function (req, res) {
  var document = req.embeddedDoc;
  var upload = multer(multerConfig).single('picture');
  if (document) {
    upload(req, res, function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (req.file) {
        document.picture.add(config.uploads.pictures.temp.path + req.file.filename);
        res.send({
          message: 'picture added'
        });
      } else {
        res.status(422).send({
          message: 'cant add picture'
        });
      }
    });
  }
}

exports.list = function (req, res) {
  var document = req.embeddedDoc;
  if (document.picture) {
    res.json(document.picture);
  } else {
    res.json([]);
  }
}

exports.getPicture = function (req, res) {
  var document = req.embeddedDoc;
  var picture = {};
  if (document.picture) {
    picture = document.picture.find(function (pict) {
      if (pict._id === req.params.pictureId) {
        return true;
      }
    });
  }
  res.json(picture);
}

exports.pictureDelete = function (req, res) {

}