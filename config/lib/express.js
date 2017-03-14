'use strict';


var config = require('../config'),
  path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  serverFiles = require('../struct/server.files'),
  methodOverride = require('method-override'),
  cors = require('cors'),
  MongoStore = require('connect-mongo')(session);

module.exports.initMiddleware = function (app) {
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cors());
}

module.exports.initModels = function () {
  serverFiles.models.forEach(function (model) {
    require(path.resolve(model));
  });
}

module.exports.initSession = function (app, db) {
  app.use(session({
    secret: config.session.secret,
    saveUninitialized: true,
    resave: true,
    cookie: {
      //      maxAge: config.sessionCookie.maxAge,
    },
    //  name: config.sessionKey,
    store: new MongoStore({
      mongooseConnection: db.connection,
      collection: config.sessionCollection
    })
  }));
};

module.exports.initConfigs = function (app, db) {
  serverFiles.config.forEach(function (configPath) {
    require(path.resolve(configPath))(app, db);
  });
}

var initCore = function (app) {
  serverFiles.core.routes.forEach(function (route) {
    require(path.resolve(route))(app);
  });
}

module.exports.initPolicies = function (app){
  serverFiles.policies.forEach(function (policyPath) {
    require(path.resolve(policyPath)).invokeRolesPolicies();
  });
}

module.exports.initRoutes = function (app) {
  serverFiles.routes.forEach(function (route) {
    require(path.resolve(route))(app);
  });
  initCore(app);
}

module.exports.initServer = function (db) {
  var app = express();
  this.initMiddleware(app);
  this.initModels();
  this.initSession(app, db);
  this.initConfigs(app, db);
  this.initPolicies(app);
  this.initRoutes(app);
  return app;
}