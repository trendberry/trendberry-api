'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  skuPlugin = require('./product.sku.model'),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

/**
 * Product Schema
 */
var ProductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Product name',
    trim: true
  },
  groupId: String,
  offerId: {
    type: String,
    required: 'Offer id required',
    },
  description: String,
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  price: Number,
  oldPrice: Number,
  slug: String,
  url: {
    type: String,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  age: {
    type: Number,
    enum: [null, 1, 2, 3],
    default: null
  },
  color: [String],
  material: [String],
  size: [String],
  sex: {
    type: Number,
    enum: [null, 1, 2, 3],
    default: null
  },
  season: String,
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  created: {
    type: Date,
    default: Date.now
  },
});


//ProductSchema.plugin(picturePlugin, config.uploads.pictures.product);
ProductSchema.plugin(skuPlugin);

mongoose.model('Product', ProductSchema);