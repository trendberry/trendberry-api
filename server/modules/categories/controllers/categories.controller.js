'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller')),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Category = mongoose.model('Category'),
  async = require('async'),
  crypto = require('crypto');

/**
 * Create a Category
 */
exports.create = function (req, res) {
  var category = new Category(req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Show the current Category
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};

  res.jsonp(category);
};

/**
 * Update a Category
 */
exports.update = function (req, res) {

  var category = req.category;

  category = _.extend(category, req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * Delete an Category
 */
exports.delete = function (req, res) {
  var category = req.category;

  category.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * List of Categories
 */
exports.list = function (req, res) {
  var sort = req.query.sort ? req.query.sort : 'path';
  // var sortParam = sort.replace('-', '');
  // sort = 'path';
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  var limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  // var match = req.query.match ? req.query.match : {};
  var match = {};
  if (req.query.name !== undefined) {
    match.name = {
      '$regex': req.query.name,
      '$options': 'i'
    };
  }

  if (req.query.parent !== undefined) {
    match.parent = req.query.parent ? new ObjectId(req.query.parent) : null;
  }

  // Maybe there less ugly way to solve sorting
  // if (req.query.sort === 'name') {
  //   sort = 'ancestors.0.name';
  // } else if (req.query.sort === '-name') {
  //   sort = '-ancestors.name';
  // }

  async.parallel([function (callback) {
    Category.find(match).count(function (err, count) {
      callback(err, count);
    });
  }, function (callback) {
    // Category.find(filter).skip((page - 1) * limit).limit(limit).sort(sort).exec(function (err, categories) {
    //   callback(err, categories);
    // });
    Category
      .aggregate()
      .match(match)
      .append({
        $graphLookup: {
          from: 'categories',
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'ancestors'
        }
      })
      .project({
        _id: 1,
        name: 1,
        description: 1,
        slug: 1,
        created: 1,
        parent: 1,
        ancestors: 1,
        picture: 1,
        path: {
          $concatArrays: [
            {
              $map: {
                input: '$ancestors',
                as: 'a',
                in: ['$$a.name', '$$a._id']
              }
            },
            [['$name', '$_id']]
          ]
        }
      }).sort(sort).skip((page - 1) * limit).limit(limit).exec(function (err, categories) {
        callback(err, categories);
      });

  }], function (err, results) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        items: results[1],
        count: results[0]
      });
    }
  });
};

/**
 * Upload category picture
 */
exports.pictureCreate = function (req, res) {
  var category = req.category;
  var existingImageName;

  var multerConfig = config.uploads.category.image;
  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
  multerConfig.storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(config.uploads.category.image.dest))
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname))
      })
    }
  });
  var upload = multer(multerConfig).single('picture');

  if (category) {
    uploadImage()
      .then(updateCategory)
      .then(function () {
        res.json(category);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(404).send({
      message: 'Category not found!'
    });
  }

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

  function updateCategory() {
    return new Promise(function (resolve, reject) {
      category.picturesToUpload = req.file;
      category.save(function (err, thecategory) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

};

exports.pictureDelete = function (req, res) {
  var category = req.category;
  category.picturesToDelete = [req.params.pictureId];

  category.save(function (err, category) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ data: category, pictureId: req.params.pictureId });
    }
  });
};

/**
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Category is invalid'
    });
  }

  Category.findById(id).populate('parent').exec(function (err, category) {
    if (err) {
      return next(err);
    } else if (!category) {
      return res.status(404).send({
        message: 'No Category with that identifier has been found'
      });
    }
    req.category = category;
    next();
  });
};
