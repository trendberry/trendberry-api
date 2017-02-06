'use strict';

module.exports = {
  core: {
    routes: 'server/core/routes/**/*.js'
  },
  models: 'server/modules/*/models/**/*.js',
  routes: 'server/modules/*/routes/**/*.js',
  config: 'server/modules/*/config/*.js',
  policies: 'server/modules/*/policies/*.js'
}