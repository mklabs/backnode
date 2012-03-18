


var Backbone = require('backbone'),
  underscore = _ = require('underscore'),
  connect = require('connect'),
  proto = require('./backnode/application'),
  router = require('./backnode/router'),
  view = require('./backnode/view');

var backnode = module.exports = createApplication;

// expose Backbonen API
backnode.Router     = Backbone.Router;
backnode.Model      = Backbone.Model;
backnode.Collection = Backbone.Collection;
backnode.View       = Backbone.View;

// Router Overrides
_.extend(backnode.Router.prototype, router.proto);
_.extend(backnode.View.prototype, view);


// Create a new backbone application.
function createApplication() {
  var app = connect();
  _.extend(app, proto);
  return app;
}

// borrowed to express for its getOwnPropertyDescriptor usage
Object.keys(connect.middleware).forEach(function(key) {
  var descriptor = Object.getOwnPropertyDescriptor(connect.middleware, key);
  Object.defineProperty(backnode, key, descriptor);
});
