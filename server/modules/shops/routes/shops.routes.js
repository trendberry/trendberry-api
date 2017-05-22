'use strict';

var shopsPolicy = require('../policies/shops.policy'),
  shops = require('../controllers/shops.controller'),
  path = require('path'), 
  pictures = require(path.resolve('./server/modules/pictures/controllers/pictures.controller'));

module.exports = function(app) {
  // Shops Routes
  app.route('/api/shops')//.all(shopsPolicy.isAllowed)
    .get(shops.list)
    .post(shops.create);

  app.route('/api/shops/:shopId')//.all(shopsPolicy.isAllowed)
    .get(shops.read)
    .put(shops.update)
    .delete(shops.delete);

  // Picture Routes
  app.route('/api/shops/:shopId/picture')
    .get(pictures.list)
    .post(pictures.uploadPicture);

  app.route('/api/shops/:shopId/picture/:pictureId')
 //   .get(pictures.getPicture)
 //   .delete(pictures.deletePicture);

  // Finish by binding the Shop middleware
  app.param('shopId', shops.shopByID);
};
