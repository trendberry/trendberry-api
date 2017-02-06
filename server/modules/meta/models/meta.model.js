'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async');

/**
 * Meta Plugin
 */
module.exports = function metaPlugin(schema, options) {
  schema.add({
    meta: {
      title: String,
      description: String
    }
  });

  schema.pre('save', function (next) {

    if (!this.meta) this.meta = {};

    // Generate Meta Title with template if it's empty
    if (!this.meta.title) {
      this.meta.title = 'generated title';
    }

    // Generate Meta Description with template if it's empty
    if (!this.meta.description) {
      this.meta.description = 'generated description';
    }

    next();
  });
};
