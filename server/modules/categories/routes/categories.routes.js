'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.policy'),
  categories = require('../controllers/categories.controller');

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

  // Category pictures routes
  app.route('/api/categories/:categoryId/pictures')//.all(categoriesPolicy.isAllowed)
    .post(categories.pictureCreate);

  // Single category routes
  app.route('/api/categories/:categoryId/pictures/:pictureId')//.all(categoriesPolicy.isAllowed)
    .delete(categories.pictureDelete);

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
