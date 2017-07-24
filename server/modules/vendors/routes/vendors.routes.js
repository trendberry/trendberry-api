'use strict';

/**
 * Module dependencies
 */
var vendorsPolicy = require('../policies/vendors.policy'),
  vendors = require('../controllers/vendors.controller'),
  path = require('path'),
  pictures = require(path.resolve('./server/modules/pictures/controllers/pictures.controller'));

module.exports = function(app) {
  // Vendors Routes
  app.route('/api/vendors').all(vendorsPolicy.isAllowed)
    .get(vendors.list)
    .post(vendors.create);

  app.route('/api/vendors/:vendorId').all(vendorsPolicy.isAllowed)
    .get(vendors.read)
    .put(vendors.update)
    .delete(vendors.delete);

  // Picture routes
  app.route('/api/vendors/:vendorId/picture')
    .get(pictures.list)
    .post(pictures.uploadPicture);

  app.route('/api/vendors/:vendorId/picture/:pictureId')
    .get(pictures.getPicture)
    .delete(pictures.deletePicture);    

  // Finish by binding the Vendor middleware
  app.param('vendorId', vendors.vendorByID);
};
