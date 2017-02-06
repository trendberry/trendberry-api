'use strict';

var serverStruct = require('./server.struct'),
  glob = require('glob');

var getPaths = function (pattern) {
  return glob.sync(pattern);
}

module.exports = {
  core: {
    routes: getPaths(serverStruct.core.routes)
  },
  models: getPaths(serverStruct.models),
  routes: getPaths(serverStruct.routes),
  config: getPaths(serverStruct.config),
  policies: getPaths(serverStruct.policies),
  getPaths: getPaths
}