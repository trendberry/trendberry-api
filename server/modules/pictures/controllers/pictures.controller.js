'use strict';

var fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  crypto = require('crypto'),
  plugedModels = [];
 
//mongoose.modelNames  

var multerConfig = {};
//multerConfig.fileFilter = function (req, file, callback) {
  //if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    //var err = new Error();
    //err.code = 'UNSUPPORTED_MEDIA_TYPE';
    //return callback(err, false);
//  }
//  callback(null, true);
//};
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
var upload = multer().single('picture');

exports.pictureByID = function (req, res, next, id) {
  

};



exports.uploadPicture = function(req, res){
function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  uploadImage().then(function(){
    console.log(req.file);
  })


//  res.send('sd');
}
