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
  for (var i in this.schema.obj) {
    if (this[i]) {
      hashData = hashData.concat(this[i])
    }
  }
  this._hash = crypto.createHash('md5').update(hashData).digest("hex");
}

SkuSchema.virtual('hash').get(function () {
  if (!this._hash) {
    this.makeHash();
  }
  return this._hash;
});


SkuSchema.pre('save', function (next) {
  if (this.isModified() || this.isNew) {
    this.makeHash();
  }
  next();
});

module.exports = function skuPlugin(schema, options) {
  schema.add({
    sku: [SkuSchema]
  });

  schema.methods.addSku = function (sku) {
    if (this.sku) {
      var doc = this.sku.find(function (element) {
        if (element.offerId == sku.offerId) {
          return true;
        }
      });
      if (doc) {
        if (doc.hash != sku.hash) {
          Object.assign(doc, sku)
        }
      } else {
        this.sku.push(sku);
      }
    }
  }
}