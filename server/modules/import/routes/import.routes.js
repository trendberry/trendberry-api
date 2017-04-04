'use strict';


var importPolicy = require('../policies/import.policy'),
  importController = require('../controllers/import.controller');

// importId is is Id of corresponding shop

module.exports = function (app) {
 
  app.route('/api/import/:importId/start').all(importPolicy.isAllowed)
    .post(importController.start);

  app.route('/api/import/:importId/pause').all(importPolicy.isAllowed)
    .post(importController.pause);

  app.route('/api/import/:importId/resume').all(importPolicy.isAllowed)
    .post(importController.resume);    
  
  app.route('/api/import')//.all(importPolicy.isAllowed)
    .get(importController.list);

  app.route('/api/import/:importId').all(importPolicy.isAllowed)
    .get(importController.info);

  app.param('importId', importController.importByID);  
 };
