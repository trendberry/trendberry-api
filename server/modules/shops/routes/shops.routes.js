'use strict';

var shopsPolicy = require('../policies/shops.policy'),
  shops = require('../controllers/shops.controller');

module.exports = function(app) {
  // Shops Routes
  app.route('/api/shops')//.all(shopsPolicy.isAllowed)
    .get(shops.list)
    .post(shops.create);

  app.route('/api/shops/:shopId')//.all(shopsPolicy.isAllowed)
    .get(shops.read)
    .put(shops.update)
    .delete(shops.delete);

  // Finish by binding the Shop middleware
  app.param('shopId', shops.shopByID);
};
