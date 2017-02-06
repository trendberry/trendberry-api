'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  slugify = require('transliteration').slugify;

/**
 * Vendor Schema
 */
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

VendorSchema.pre('save', function (next) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});

mongoose.model('Vendor', VendorSchema);
