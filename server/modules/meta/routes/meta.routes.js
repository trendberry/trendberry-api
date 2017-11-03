'use strict';

/**
 * Module dependencies
 */
var //metaPolicy = require('../policies/meta.policy'),
  meta = require('../controllers/meta.controller'),
  path = require('path');
 

module.exports = function(app) {
  // Meta Routes
  app.route('/api/meta')//.all(productsPolicy.isAllowed)
    .get(meta.list);
   
};
