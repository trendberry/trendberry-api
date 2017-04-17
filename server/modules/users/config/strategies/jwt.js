'use strict';

var passport = require('passport'),
  User = require('mongoose').model('User'),
  JwtStrategy = require('passport-jwt').Strategy,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function () {
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = config.jwtSecret;

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  return User.findById(jwt_payload.sub, function(err, user){
    if (err || !user) {
        return res.status(401).message('ddd').end();
      }

      return next();
   // next(null, user);  
  })
});
passport.use(strategy);
}