'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  fs = require('fs'),
  gm = require('gm'),
  path = require('path'),
  async = require('async'),
  config = require(path.resolve('./config/config'));

/**
 * Pictures Plugin
 */
module.exports = function picturePlugin(schema, options) {
  schema.add({
    picture: [{
      name: String,
      color: String,
      order: {
        type: Number,
        default: 0
      }
    }]
  });

  if (options && options.picturesPath) {
    if (!(fs.existsSync(options.picturesPath))) {
      options.picturesPath.split(path.sep).forEach(function (dir, index, arr) {
        var parent = arr.slice(0, index).join(path.sep);
        var dirPath = path.resolve(parent, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
      });
    }
  }

  /**
   * Append new pictures
   * @param pictures [array|object]
   */
  schema.virtual('picturesToUpload').set(function (pictures) {

    if (!this.picture) this.picture = [];

    if (!Array.isArray(pictures)) pictures = [pictures];

    for (var i = 0; i < pictures.length; i++) {
      if (pictures[i].filename) {
        this.picture.push({
          name: pictures[i].filename
        });
      }
    }
  });

  /**
   * Delete images
   */
  schema.virtual('picturesToDelete').set(function (picturesIds) {
    console.log(picturesIds);
    if (this.picture && this.picture.length > 0 && Array.isArray(picturesIds)) {
      this.picture = this.picture.filter(function (value) {
        if (picturesIds.indexOf(value._id.toString()) === -1) {
          return true;
        } else {
          fs.unlink(path.resolve(options.picturesPath, value.name), function (err) {
            console.log(err);
          });
          return false;
        }
      })
    }
  });

  /**
   * Generate dominant color for image if it's missing
   */
  schema.pre('save', function (next) {
    var savePict = function (picture, callback) {
      if (!picture.name || picture.color != null) {
        return callback();
      }
      gm(path.resolve(options.picturesPath, picture.name))
        .resize(15, 15)
        .colors(2)
        .toBuffer('RGB', function (error, buffer) {
          console.log(buffer);
          picture.color = '#' + buffer.slice(0, 3).toString('hex');
          callback();
        });
    };
    if (this.picture.length > 0)
      async.eachSeries(this.picture, function (picture, callback) {
        if (!picture.color)
          savePict(picture, callback);
        else
          callback();
      }, function () {
        next();
      });
    else
      next();
  });

  /**
   * Delete all images after doc is removed
   * TODO: need to move it to schema.pre('remove')
   */
  schema.post('remove', function (doc) {
    for (var i = 0; i < this.picture.length; i++) {
      fs.unlink(path.resolve(options.picturesPath, doc.picture[i].name), function (err) {});
    }
  });
};
