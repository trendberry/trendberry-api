'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var MetaSchema = new Schema({
  title: String,
  description: String,
  document: {
    id: {
      type: mongoose.SchemaTypes.ObjectId
    },
    model: String
  }
});

var Meta = mongoose.model('Meta', MetaSchema);

module.exports = function metaPlugin(schema, options) {
  schema.add({
    meta: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Meta'
    }
  });

  schema.methods.generateMetaField = async function (template) {
    var self = this;
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
    var resultString = template.replace(/\[([\w|\.]+)\]/g, function (match, propName) {
      if (propName.indexOf('.') !== -1) {
        var paths = propName.split('.');

        var current = self;
        for (var i = 0; i < paths.length; i++) {
          if (current[paths[i]] === undefined) {
            return '';
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
  };

  schema.pre('save', async function (next) {
    if (this.meta instanceof mongoose.Types.ObjectId) {
      await this.populate('meta').execPopulate();
    }
    if (!this.meta) {
      this.meta = new Meta({
        document: {
          id: this,
          model: this.constructor.modelName
        }
      });

    }
    if (!this.meta.title) {
      if (options && options.meta && options.meta.title) {
        this.meta.title = await this.generateMetaField(options.meta.title);
      }
    }
    if (!this.meta.description) {
      if (options && options.meta && options.meta.description) {
        this.meta.description = await this.generateMetaField(options.meta.description);
      }
    }
    if (this.meta instanceof Meta && this.meta.isModified())
      this.meta.save();
    next();
  });
};