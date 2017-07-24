'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  fs = require('fs'),
  gm = require('gm'),
  path = require('path'),
  async = require('async'),
  crypto = require('crypto'),
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
  if (options && options.path) {
    if (!(fs.existsSync(options.path))) {
      options.path.split('/').forEach(function (dir, index, arr) {
        var parent = arr.slice(0, index).join('/');
        var dirPath = path.resolve(parent, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
      });
    }
  }

  schema.methods._getMainColor = function (picture) {
    return new Promise((resolve, reject) => {
      gm(picture.source)
        .resize(15, 15)
        .colors(2)
        .toBuffer('RGB', function (error, buffer) {
          if (error) {
            return reject(error);
          }
          return resolve('#' + buffer.slice(0, 3).toString('hex'));
        });
    });
  }

  schema.methods._resizeAndSave = function (picture) {
    return new Promise((resolve, reject) => {
      var fileName = crypto.pseudoRandomBytes(16).toString('hex') + Date.now().toString() + path.extname(picture.name);
      gm(picture.source)
        .resize(options.requiredSize.x, options.requiredSize.x)
        .toBuffer(function (error, buffer) {
          if (error) {
            return reject(error);
          }
          fs.writeFile(path.join(options.path, fileName), buffer, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(fileName);
          });
        });
    });
  }

  schema.methods.addPicture = async function (picture) {
    var pict = {};
    if (typeof picture === 'string') {
      pict.name = path.basename(picture);
      pict.source = fs.readFileSync(picture);
    } else {
      pict.name = picture.originalname;
      pict.source = picture.buffer;
    }

    try {
      var result = await Promise.all([this._resizeAndSave(pict), this._getMainColor(pict)]);
      var newPicture = this.picture.create({
        name: result[0],
        color: result[1]
      });
      this.picture.push(newPicture);
      return this.picture;
    } catch (e) {
      return {
        error: e.message
      }
    }
  }

  schema.methods.deletePicture = function (picture) {
    try {
      var result = this.picture.pull(picture);
      fs.unlinkSync(path.join(options.path, picture.name));
      return result;
    } catch (e) {
      return ({
        error: e.message
      });
    }
  }

  schema.post('remove', function (doc) {
    for (var i = 0; i < this.picture.length; i++) {
      fs.unlink(path.join(options.path, doc.picture[i].name), function (err) {
        if (err) {
          console.log(err.message);
        }
      });
    }
  });
};