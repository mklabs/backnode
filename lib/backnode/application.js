
var backnode = require('../backnode'),
  connect = require('connect'),
  util = require('util'),
  Config = require('cfg').Config,
  View = require('./view'),
  Router = require('./router'),
  engines = require('./engines'),
  middleware = require('./middleware');


var app = module.exports;


// application prototype, mixin meant to be used with connect
// application.

// **init** Init the server.
//
// - Augment the app object with cfg.js API and setup default configuration
// - setup default middleware, and extended req / res if provided.
//
app.init = function(req, res){
  Config.call(this, { envPrefix: 'backnode' });
  _.extend(this, Config.prototype, { configure: Config.prototype.env });

  this.engines  = {};
  this.request  = this.req = req;
  this.response = this.res = res;

  // default configuration
  this.set('env', this.env());
  this.set('view engine', 'html');

  this.engine('.html', engines.hogan);

  // default middlewares
  this.use(connect.query());
  this.use(middleware.init(this));

  this.configure('development', function() {});
  this.configure('production', function() {});
};

// **use** Proxy  `connect.use` to apply configuration and init /
// register Backbone Router.
app.use = function(route, fn){
  // default route to '/'
  if (typeof route !== 'string') fn = route, route = '/';
  this.route = route;
  if(fn instanceof Router) return this.router(route, fn);
  connect.proto.use.call(this, route, fn);
  return this;
};

// **router** Proxy `connect.use` and wraps the created Backbone router
// into a connect middleware. Creates the router instance, and places it
// in the connect middleware stack.
app.router = function _router(route, router) {
  if(!(router instanceof Router)) throw new Error('app.router must be called with a Backbone.Router');

  // give it the app mount-point
  router.root = new RegExp('^' + route);

  connect.proto.use.call(this, route, function(req, res, next) {
    Router.handler.handle(route, req, function(e, handler) {
      if(e) return next(e);
      // no match for this route
      if(!handler) return next();
      handler.callback(req, res, next);
    });
  });
  return this;
};

//
// **engine** map the express app.engine api. Register the given
// template engine as `ext`.
//
//    app.engine('.html', backnode.engines.handlebars);
//
// or
//
//    app.engine('.jade', backnode.engines.jade);
//
app.engine = function engine(ext, cb) {
  if(ext.charAt(0) !== '.') ext = '.' + ext;
  this.engines[ext] = cb;
  return this;
};


//
// **render** Render the given view `name` with `data` and a callback
// with an error and the rendered template.
//
app.render = function render(name, data, cb) {
  // support callback function as second arg
  if(typeof data === 'function') cb = data, data = {};

  var view = new View({
    id: name,
    engine: this.get('view engine'),
    engines: this.engines,
    root: this.get('views')
  });

  // render
  try {
    view.render(data, cb);
  } catch (err) {
    cb(err);
  }
};

//
// **listen** Proxy `connect.listen` to setup provided port in app configuration.
//
app.listen = function listen() {
  var port = toPort(arguments[0]);
  if(port) this.set('port', port);
  return connect.proto.listen.apply(this, arguments);
};


//
// ### Helpers
//
function toPort(x) { return (x = Number(x)) >= 0 ? x : false; }
