'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
  settings = require(path.resolve('./server/modules/settings/lib/settings.js'));



module.exports = function slugPlugin(schema, options) {
  schema.add({
    slug: String
  });

  schema.methods.generateSlug = async function (template) {
    var regExp = new RegExp(/\[([\w|\.]+)\]/g);
    var match = regExp.exec(template);
    while (match != null && match.length > 1) {
      if (match[1].indexOf('.') !== -1) {
        match[1] = match[1].split('.')[0];
      }
      if (this[match[1]] instanceof mongoose.Types.ObjectId && match[1] !== '_id') {
        await this.populate(match[1]).execPopulate();
      }
      match = regExp.exec(template);
    }
    var slug = template.replace(/\[([\w|\.]+)\]/g, (match, propName) => {
      if (propName.indexOf('.') !== -1) {
        var paths = propName.split('.');
        var current = this;
        for (var i = 0; i < paths.length; i++) {
          if (current[paths[i]] === undefined) {
            return '';
          } else {
            current = current[paths[i]];
          }
        }
        return slugify(current);
      } else {
        if (this[propName]) {
          return slugify(this[propName]);
        }
      }
    });
    this.slug = slug;
    return slug;
  };

  schema.pre('save', async function (next) {
    if (!this.slug || this.slug.length === 0 || this.isModified()) {
      await this.generateSlug(options.slug);
    }
    next();
  });
};