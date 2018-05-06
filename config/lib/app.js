'use strict';

var config = require('../config'),
  mongoose = require('./mongoose'),
  express = require('./express'),
  http = require('http');

  var a = new RegExp('a', 'i').test('a')
console.log(a)



module.exports.startServer = function () {
  mongoose.connect(function (db) {
    var app = express.initServer(db);
    var server = app.listen(config.server.port, config.server.host, () => console.log('Server started'));
    server.on('upgrade', (req, socket, head) => {
      app.wss.handleUpgrade(req, socket, head, function (client) {
        app.wss.emit('connection', client, req);
      });
    });
  });
};