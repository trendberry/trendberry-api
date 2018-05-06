'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  crypto = require('crypto'),
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
  _hash: String
});

SkuSchema.plugin(picturePlugin, config.uploads.pictures.product);

SkuSchema.methods.makeHash = function () {
  var hashData = '';
  var tree = this.schema.obj;
  delete tree._hash;
  for (let field in tree) {
    if (this[field]) {
      hashData = hashData.concat(this[field]);
    }
  }
  this._hash = crypto.createHash('md5').update(hashData).digest("hex");
};

SkuSchema.methods.updateSku = function(source){
  if (!source.hash) return null;
  if (source.hash != this.hash) {
    for (let field in this.schema.obj) {
      if (source[field]) this[field] = source[field];
    }
    this._hash = null;
    return this;
  } else return null;
};

SkuSchema.virtual('hash').get(function () {
  if (!this._hash || this.isModified()) {
    this.makeHash();
  }
  return this._hash;
});

module.exports = function skuPlugin(schema, options) {
  schema.add({
    sku: [SkuSchema]
  });

  schema.methods.hasSku = function(sku){
    if (!this.sku || !sku.offerId) return false;
    for (var targetSku of this.sku){
      if (targetSku.offerId = sku.offerId){
        return targetSku;
      }
    }
    return false;
  };
};