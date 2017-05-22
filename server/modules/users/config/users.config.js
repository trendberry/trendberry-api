'use strict';

var passport = require('passport'),
  User = require('mongoose').model('User'),
  path = require('path'),
  serverFiles = require(path.resolve('./config/struct/server.files')),
  jwt = require('jsonwebtoken'),
  config = require(path.resolve('./config/config'));

function checkToken(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split()[1];
    jwt.verify(token, config.jwtSecret, function (err, payload) {
      if (!err) {
        User.findById(payload.sub, function (err, user) {
          if (!err) {
            req.user = user;
          }
          return next();
        });
      } else {
        return res.status(401).send(err.message);
      }
    })
  } else {
    next();
  }
}


module.exports = function (app, db) {
  serverFiles.getPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
    require(path.resolve(strategy))(passport);
  });

  // app.use(passport.authenticate('jwt', {
  // session: false
  //  }));

  app.use(passport.initialize());
  app.use(checkToken);

};