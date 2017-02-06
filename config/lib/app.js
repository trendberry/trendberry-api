'use strict';

var config = require('../config'),
  mongoose = require('./mongoose'),
  express = require('./express');


module.exports.startServer = function () {
  mongoose.connect(function (db) {
    var app = express.initServer(db);
    app.listen(config.server.port, config.server.host);
    console.log('Server started');
  });

}