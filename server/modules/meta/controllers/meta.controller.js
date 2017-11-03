'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  Meta = mongoose.model('Meta'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./server/core/controllers/errors.controller'));

exports.list = async(req, res) => {
  var sort = req.query._sort ? req.query._sort : config.pagination.default.sort;
  var page = req.query._page ? parseInt(req.query._page, 10) : config.pagination.default.page;
  var limit = req.query._limit ? parseInt(req.query._limit, 10) : config.pagination.default.limit;
  if (req.query._order === 'DESC') {
    sort = '-' + sort;
  }
  var list = {
    count: 0,
    items: []
  };
  var query = {};
  if (req.query.q) {
    query.name = {
      '$regex': req.query.q,
      '$options': 'i'
    };
  };

  try {
    list.count = await Meta.count(query);
    if (list.count != 0) {
      list.items = await Meta.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec();
    }
    return res.json(list);
  } catch (e) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  }
};