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

  schema.methods.generateMetaField = function (template) {
    var self = this;
    var resultString = template.replace(/\[([\w|\.]+)\]/g, function (match, propName) {
      if (propName.indexOf('.') !== -1) {
        var paths = propName.split('.');

        var current = self;
        for (i = 0; i < paths.length; i++) {
          if (self[paths[i]] === undefined) {
            return undefined;
          } else {
            current = current[paths[i]];
          }
        }
        return current;
      } else {
        if (self[propName]) {
          return self[propName];
        }
      }
    });
    return resultString;
  }

  schema.pre('save', function (next) {
    if (!this.meta) this.meta = {};

    // Generate Meta Title with template if it's empty
    if (!this.meta.title) {
      if (options.title !== undefined) {
        this.meta.title = this.generateMetaField(options.title);
      }
    }

    // Generate Meta Description with template if it's empty
    if (!this.meta.description) {
      if (options.description !== undefined) {
        this.meta.description = this.generateMetaField(options.description);
      }
    }
    next();
  });
};