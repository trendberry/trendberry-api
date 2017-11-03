'use strict';

var WebSocket = require('ws'),
  jwt = require('jsonwebtoken'),
  config = require('../config');

module.exports = () => {
  var verify = (info, cb) => {
    var policy = wss.paths[info.req.url];
    if (policy == 'all') return cb(true);
    else {
      if (info.req.headers.authorization) {
        var token = info.req.headers.authorization.split(' ')[1];
        jwt.verify(token, config.jwtSecret, (err, payload) => {
          if (!err) {
            if (payload.admin) {
              return cb(true);
            }
          }
        });
      }
    }
    cb(false, 403, 'Unauthorized');
  };

  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: verify
  });
  wss.paths = {};
  wss.shouldHandle = function (request) {
    if (this.paths[request.url]) return true;
    return false;
  };
  wss.on('connection', function connection(ws, req) {
    wss.broadcast('dd')
    ws.on('message', function incoming(data) {
      //return ws.send('sdfg')
      // Broadcast to everyone else. 
      // console.log(wss.options)
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });
  });
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {

      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
  return wss;
};