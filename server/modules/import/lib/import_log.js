'use strict';

var dateFormat = require('dateformat'),
  path = require('path'),
  fs = require('fs'),
  config = require(path.resolve('./config/config'));

function ImportLog(shopName) {
  this.shopName = shopName;
  this.sep = [];
  this.sep.length = 150;
  this.sep.fill('-');
  this.sep = this.sep.join('');
 }

ImportLog.prototype.start = function () {
  var importPath = path.join(config.import.logPath, dateFormat(Date.now(), 'yyyy-mm-dd'));
  if (!fs.existsSync(importPath)) {
    fs.mkdirSync(importPath);
  }
  this.logFile = path.join(importPath, this.shopName + '_' + dateFormat(Date.now(), 'HH_MM_ss') + '.log');
  this.stream = fs.createWriteStream(this.logFile);
}

ImportLog.prototype.end = function () {
  if (this.stream) {
    this.stream.end();
  }
  this.logFile = null;
}

ImportLog.prototype.writeLine = function (data) {
  if (typeof data === 'string') {
    this.stream.write(data);  
  } else {
    this.stream.write(JSON.stringify(data, "", 2));
  }
  
  this.stream.write('\n');
}

ImportLog.prototype.separate = function () {
  this.stream.write(this.sep);
  this.stream.write('\n');
}

module.exports = ImportLog;