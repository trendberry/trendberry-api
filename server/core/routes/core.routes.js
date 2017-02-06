'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.controller');

  // Define error pages
  app.route('/server-error').get(core.sendServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.sendNotFound);

 // app.route('/*').get(core.sendNotFound);
};
