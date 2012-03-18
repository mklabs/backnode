


var Backbone = require('backbone'),
  underscore = _ = require('underscore'),
  connect = require('connect'),
  res = require('./backnode/response'),
  req = require('./backnode/request'),
  application = require('./backnode/application');

var backnode = module.exports = create;

// expose consolidate engines
backnode.engines = require('./backnode/engines');

// expose Backbone API
backnode.Router     = require('./backnode/router');
backnode.View       = require('./backnode/view');
backnode.Model      = Backbone.Model;
backnode.Collection = Backbone.Collection;

backnode.response = res;



// Create a new connect application.
function create() {
  var app = connect();
  _.extend(app, application);
  app.init(req, res);
  return app;
}

// borrowed to express for its getOwnPropertyDescriptor usage. Proxy each of the
// connect middleware as `backnode.*`
Object.keys(connect.middleware).forEach(function(key) {
  var descriptor = Object.getOwnPropertyDescriptor(connect.middleware, key);
  Object.defineProperty(backnode, key, descriptor);
});
