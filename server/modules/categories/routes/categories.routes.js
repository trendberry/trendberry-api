'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.policy'),
  categories = require('../controllers/categories.controller');

module.exports = function (app) {
  // Categories collection routes
  app.route('/api/categories').all(categoriesPolicy.isAllowed)
  /**
   * @api {get} /api/categories Get list of categories
   * @apiVersion 0.0.1
   * @apiName GetCategories
   * @apiGroup Category
   * @apiPermission none
   *
   * @apiDescription None
   *
   * @apiParam {String} id The Users-ID.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/api/categories
   *
   * @apiSuccess {Number}   count                       Total number of categories.
   * @apiSuccess {Object[]} items                       List of categories.
   * @apiSuccess {String}   items._id                   The Category-ID.
   * @apiSuccess {Date}     items.created               Creation Date.
   * @apiSuccess {String}   items.name                  Name of the Category.
   * @apiSuccess {String}   items.description           Name of the Category.
   * @apiSuccess {String}   items.parent                Category Parent-ID.
   * @apiSuccess {Object}   items.picture               Picture of the category.
   * @apiSuccess {Object}   items.picture.name          Picture name.
   * @apiSuccess {Object}   items.picture.color         Picture name.
   * @apiSuccess {Object}   items.picture.path          Picture path.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "count":17,
   *       "items": [
   *         {
   *           "_id": "587ec41c3451840898052386",
   *           "slug": "devochke",
   *           "created": "2017-01-18T01:25:48.296Z",
   *           "name": "Девочке",
   *           "parent": null,
   *           "ancestors": [],
   *           "path": [
   *             [
   *               "Девочке",
   *               "587ec41c3451840898052386"
   *             ]
   *           ]
   *         }
   *       ]
   *     }
   *
   * @apiError NoAccessRight Only authenticated Admins can access the data.
   * @apiError CategoriesNotFound   The <code>id</code> of the Category was not found.
   *
   * @apiErrorExample Response (example):
   *     HTTP/1.1 401 Not Authenticated
   *     {
   *       "error": "NoAccessRight"
   *     }
   */
    .get(categories.list)
    .post(categories.create);

  // Single category routes
  app.route('/api/categories/:categoryId').all(categoriesPolicy.isAllowed)
    .get(categories.read)
    .put(categories.update)
    .delete(categories.delete);

  // Category pictures routes
  app.route('/api/categories/:categoryId/pictures').all(categoriesPolicy.isAllowed)
    .post(categories.pictureCreate);

  // Single category routes
  app.route('/api/categories/:categoryId/pictures/:pictureId').all(categoriesPolicy.isAllowed)
    .delete(categories.pictureDelete);

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
