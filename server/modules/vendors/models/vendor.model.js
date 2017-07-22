'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js')),
  metaPlugin = require(path.resolve('./server/modules/meta/models/meta.model')),
  picturePlugin = require(path.resolve('./server/modules/pictures/models/pictures.model'));

var VendorSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Vendor name',
    trim: true
  },
  synonyms: [String],
  slug: String,
  created: {
    type: Date,
    default: Date.now
  }
});

VendorSchema.plugin(metaPlugin, settings.vendor);

VendorSchema.pre('save', function (next) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});

mongoose.model('Vendor', VendorSchema);
