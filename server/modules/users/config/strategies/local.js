'use strict';

var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  jwt = require('jsonwebtoken'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'usernameOrEmail',
    passwordField: 'password',
    session: false
  },
  function (usernameOrEmail, password, done) {
    User.findOne({
      $or: [{
        username: usernameOrEmail.toLowerCase()
      }, {
        email: usernameOrEmail.toLowerCase()
      }]
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user || !user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid username or password (' + (new Date()).toLocaleTimeString() + ')'
        });
      }

      var payload = {};
      payload.sub = user._id;
      if (user.roles == 'admin') payload.admin = true;
      const token = jwt.sign(payload, config.jwtSecret);
      return done(null, user, token);
    });
  }));
};
