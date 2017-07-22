'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

var ShopSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shop name',
    trim: true
  },
  lastUpdate: Date,
  description: String,
  feedUrl: String,
  slug: String,
  created: {
    type: Date,
    default: Date.now
  },
});

ShopSchema.plugin(metaPlugin, settings.shop);
ShopSchema.plugin(picturePlugin, config.uploads.pictures.shop);

ShopSchema.pre('save', function (next, done) {
  if (!this.slug || this.slug.length === 0) {
    this.slug = slugify(this.name);
  }
  next();
});

mongoose.model('Shop', ShopSchema);
