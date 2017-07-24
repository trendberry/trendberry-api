'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.policy'),
  categories = require('../controllers/categories.controller'),
  path = require('path'),
  pictures = require(path.resolve('./server/modules/pictures/controllers/pictures.controller'));  

module.exports = function (app) {
  // Categories collection routes
  app.route('/api/categories')//.all(categoriesPolicy.isAllowed)
  
    .get(categories.list)
    .post(categories.create);

  // Single category routes
  app.route('/api/categories/:categoryId')//.all(categoriesPolicy.isAllowed)
    .get(categories.read)
    .put(categories.update)
    .delete(categories.delete);

  // Picture routes
  app.route('/api/categories/:categoryId/picture')
    .get(pictures.list)
    .post(pictures.uploadPicture);

  app.route('/api/categories/:categoryId/picture/:pictureId')
    .get(pictures.getPicture)
    .delete(pictures.deletePicture);  

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
