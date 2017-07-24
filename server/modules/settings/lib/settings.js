'use strict';

var fs = require('fs'),
  path = require('path');

function Settings() {
  try {
    Object.assign(this, JSON.parse(fs.readFileSync(path.resolve('./server/modules/settings/files/settings.json'))));
  } catch (e) {
    console.log('failed to load settings');
  }
}

Settings.prototype.renew = function (source) {
  try {
    Object.keys(this).forEach((key) => delete this[key]);
    Object.keys(source).forEach((key) => this[key] = source[key]);
    fs.writeFileSync(path.resolve('./server/modules/settings/files/settings.json'), JSON.stringify(this));
    return this;
  } catch (e) {
    return ({
      error: e
    });
  }
}

Settings.prototype.update = function(source){
  try {
    Object.assign(this, source);
    fs.writeFileSync(path.resolve('./server/modules/settings/files/settings.json'), JSON.stringify(this));
    return this;
  } catch (e) {
    return ({
      error: e
    });
  } 
}

module.exports = new Settings();