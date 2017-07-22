'use strict';

var fs = require('fs'),
  path = require('path');

var settings = {};

try {
  settings = JSON.parse(fs.readFileSync(path.resolve('./server/modules/settings/files/settings.json')));
} catch (e) {
  console.log('failed to load settings');
}

module.exports = settings;