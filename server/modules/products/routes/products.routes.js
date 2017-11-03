'use strict';

/**
 * Module dependencies
 */
var productsPolicy = require('../policies/products.policy'),
  products = require('../controllers/products.controller'),
  path = require('path'),
  pictures = require(path.resolve('./server/modules/pictures/controllers/pictures.controller'));

module.exports = function(app) {
  // Products Routes
  app.route('/api/products').all(productsPolicy.isAllowed)
    .get(products.list)
    .post(products.create);

  app.route('/api/products/:productId').all(productsPolicy.isAllowed)
    .get(products.read)
    .put(products.update)
    .delete(products.delete);

  // Picture routes
  app.route('/api/products/:productId/picture')
    .get(pictures.list)
    .post(pictures.uploadPicture);

  app.route('/api/products/:productId/picture/:pictureId')
    .get(pictures.getPicture)
    .delete(pictures.deletePicture);  

  // Finish by binding the Product middleware
  app.param('productId', products.productByID);
};
