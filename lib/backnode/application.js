
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

  var self = this;

  this.engines      = {};
  this.viewFilters  = [];

  this.request  = this.req = req;
  this.response = this.res = res;

  // default configuration
  this.set('env', this.env());
  this.set('view engine', 'html');

  this.engine('.html', engines.hogan);

  // default middlewares
  this.use(connect.query());
  this.use(middleware.init(this));

  // setup application locals and view filters
  this.locals = function(obj) {
    _.each(obj, function(val, key) {
      self.locals[key] = val;
    });
    return self;
  };

  this.locals.use = function(cb) {
    self.viewFilters.push(function(req, res, next) {
      cb(req, res);
      next();
    });
    return this;
  };


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

  // update router's routes to contain the app prefix (for subapp)
  router.prefix(route);

  connect.proto.use.call(this, route, function(req, res, next) {
    Router.handler.handle(router, req, function(e, handler) {
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
// **render** Render the given view `name` with `options` and a callback
// with an error and the rendered template.
//
app.render = function render(name, options, cb) {
  var self = this,
    data = {};

  // support callback function as second arg
  if(typeof options === 'function') cb = options, options = {};

  // merge app.locals
  _.extend(data, this.locals);

  // merge options.locals
  if (options.locals) _.extend(data, options.locals);

  // merge options
  _.extend(data, options);

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
