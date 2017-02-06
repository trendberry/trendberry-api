'use strict';

/**
 * Module dependencies
 */
var vendorsPolicy = require('../policies/vendors.policy'),
  vendors = require('../controllers/vendors.controller');

module.exports = function(app) {
  // Vendors Routes
  app.route('/api/vendors').all(vendorsPolicy.isAllowed)
    .get(vendors.list)
    .post(vendors.create);

  app.route('/api/vendors/:vendorId').all(vendorsPolicy.isAllowed)
    .get(vendors.read)
    .put(vendors.update)
    .delete(vendors.delete);

  // Finish by binding the Vendor middleware
  app.param('vendorId', vendors.vendorByID);
};
