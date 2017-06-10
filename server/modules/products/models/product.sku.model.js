'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

var SkuSchema = new Schema({
  offerId: {
    type: String,
    required: 'Offer id required'
  },
  color: [String],
  price: Number,
  oldPrice: Number,
  url: String,
  material: [String],
  size: [String],
});

module.exports = function skuPlugin(schema, options) {
  schema.add({
    sku: [SkuSchema]
  });
}