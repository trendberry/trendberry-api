'use strict';

var fs = require('fs'),
  path = require('path');

function Settings() {
  try {
    var data = JSON.parse(fs.readFileSync(path.resolve('./server/modules/settings/files/settings.json')));
    Object.assign(this, data);
  } catch (e) {
    console.log('failed to load settings');
  }
}

Settings.prototype.save = function () {
  try {
    fs.writeFileSync(path.resolve('./server/modules/settings/files/settings.json'), JSON.stringify(this));
  } catch (e) {
    console.log('failed to save settings');
  }
}

module.exports = new Settings();