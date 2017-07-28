'use strict';


var app = require('./config/lib/app');
/*var cluster = require('cluster');

if (cluster.isMaster){
     for (let i = 0; i < 6; i++) {
    cluster.fork();
  }
} else {
  var server = app.startServer();    
}*/


var server = app.startServer();
