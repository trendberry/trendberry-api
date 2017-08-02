'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  skuPlugin = require('./product.sku.model'),
  crypto = require('crypto'),
  slugify = require('transliteration').slugify,
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
});

ProductSchema.methods.assignBase = function (source) {
  source.hash = '';
  for (let field in this.schema.obj) {
    if (source[field]) this[field] = source[field];
  }
  return this;
};

ProductSchema.methods.makeHash = function () {
  var hashData = '';
  var tree = Object.assign({}, this.schema.obj);
  ['groupId', 'slug', 'shop', 'hash'].forEach((field) => delete tree[field]);
  for (var i in tree) {
    if (this[i]) {
      hashData = hashData.concat(this[i])
    }
  }
  this.hash = crypto.createHash('md5').update(hashData).digest("hex");
}

ProductSchema.pre('save', function (next) {
  this.populate(['category', 'vendor', 'shop'], (err) => {
    if (!this.slug || this.slug.length === 0) {
      var vendorName = (!this.vendor) ? "" : "-" + this.vendor.name;
      this.slug = 'product-' + slugify(this.name + vendorName + '-' + this._id);
      next();
    } else {
      next();
    }
  })
});

ProductSchema.plugin(metaPlugin, settings.product);
//ProductSchema.plugin(picturePlugin, config.uploads.pictures.product);
ProductSchema.plugin(skuPlugin);

mongoose.model('Product', ProductSchema);