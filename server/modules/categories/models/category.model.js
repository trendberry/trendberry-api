'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  Schema = mongoose.Schema,
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

/**
 * Category Schema
 */
var CategorySchema = new Schema({
  name: {
    type: String,
    required: 'Please fill Category name',
    trim: true
  },
  description: String,
  slug: String,
  parent: {
    type: Schema.ObjectId,
    ref: 'Category',
    index: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Meta Title/Description middleware
 */
//CategorySchema.plugin(metaPlugin);

/**
 * Picture upload middleware
 */
CategorySchema.plugin(picturePlugin, config.uploads.pictures.category);

/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
CategorySchema.pre('save', function (next, done) {
  if (!this.slug || this.slug.length === 0) {
    this.slug = slugify(this.name);
  }
  next();
});

mongoose.model('Category', CategorySchema);
