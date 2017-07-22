'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  skuPlugin = require('./product.sku.model'),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

var ProductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Product name',
    trim: true
  },
  groupId: String,
  description: String,
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  slug: String,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  age: {
    type: Number,
    enum: [null, 1, 2, 3],
    default: null
  },
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
  hash: String,
  created: {
    type: Date,
    default: Date.now
  },
});

ProductSchema.methods.makeHash = function(){
  var tree = ['name', 'description'];  
}

ProductSchema.plugin(metaPlugin, settings.product);
//ProductSchema.plugin(picturePlugin, config.uploads.pictures.product);
ProductSchema.plugin(skuPlugin);

mongoose.model('Product', ProductSchema);