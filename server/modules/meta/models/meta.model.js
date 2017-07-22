'use strict';

var mongoose = require('mongoose'),
  async = require('async');

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
    // Generate Meta Title with template if it's empty
    if (!this.meta.title) {
      if (options && options.meta && options.meta.title) {
        this.meta.title = this.generateMetaField(options.meta.title);
      }
    }

    // Generate Meta Description with template if it's empty
    if (!this.meta.description) {
      if (options && options.meta && options.meta.description) {
        this.meta.description = this.generateMetaField(options.meta.description);
      }
    }
    next();
  });
};