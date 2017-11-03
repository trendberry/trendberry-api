'use strict';

var WebSocket = require('ws'),
  path = require('path'),
  importPolicy = require('../policies/import.policy');
  

//const ws = new WebSocket('ws://localhost:8080/test');
//var ws = {}


module.exports = (app) => {
  app.wss.paths['/events/import'] = 'admin';
  
};