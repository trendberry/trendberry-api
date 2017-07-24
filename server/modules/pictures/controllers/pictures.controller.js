'use strict';

var fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  multer = require('multer'),
  multerConfig = require(path.resolve('./config/lib/multer'));


exports.uploadPicture = function (req, res) {
  var document = req.embeddedDoc;
  var upload = multer(multerConfig).single('picture');
  if (document) {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (req.file) {
        var result = await document.addPicture(req.file);
        document.save((err, doc) => {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.json(result);
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
  var picture = {
    message: 'picture not found'
  };
  if (document.picture) {
    picture = document.picture.find(function (pict) {
      if (pict._id === req.params.pictureId) {
        return true;
      }
    });
  }
  res.json(picture);
}

exports.deletePicture = function (req, res) {
  var document = req.embeddedDoc;
  var picture;
  if (document.picture) {
    picture = document.picture.find(function (pict) {
      if (pict.id === req.params.pictureId) {
        return true;
      }
    });
    if (!picture) {
     return res.json({
        message: 'picture not found'
      });
    }
   var result = document.deletePicture(picture);
   if (result.error){
     return res.json(result);
   }
   document.save((err) => {
     if (err){
       return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(result); 
   }); 
  }
}