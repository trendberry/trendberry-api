'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
//  metaPlugin = require(path.resolve('./modules/meta/server/models/meta.server.model')),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));


/**
 * Shop Schema
 */
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

//ShopSchema.plugin(metaPlugin);

/**
 * Picture upload middleware
 */
ShopSchema.plugin(picturePlugin, config.uploads.pictures.shop);

/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
ShopSchema.pre('save', function (next, done) {
  if (!this.slug || this.slug.length === 0) {
    this.slug = slugify(this.name);
  }
  next();
});

mongoose.model('Shop', ShopSchema);
