
var connect = require('connect'),
  Backbone = require('backbone'),
  dispatcher = require('./router');

var app = module.exports;

// application prototype, mixin meant to be used with connect
// application.


// **use** Proxy  `connect.use` to apply configuration and init /
// register Backbone Router.
app.use = function(route, fn){
  // default route to '/'
  if (typeof route !== 'string') fn = route, route = '/';
  if(fn instanceof Backbone.Router) return this.router(route, fn);
  connect.proto.use.call(this, route, fn);
  return this;
};

// **router** Proxy `connect.use` and wraps the created Backbone router
// into a connect middleware. Creates the router instance, and places it
// in the connect middleware stack.
app.router = function _router(route, router) {
  if(!(router instanceof Backbone.Router)) throw new Error('app.router must be called with a Backbone.Router');
  connect.proto.use.call(this, route, function(req, res, next) {
    dispatcher.handle(req, function(e, handler) {
      if(e) return next(e);
      // no match for this route
      if(!handler) return next();
      handler.callback(req, res, next);
    });
  });
  return this;
};

