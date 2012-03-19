
var Backbone = require('backbone'),
  Events = Backbone.Events,
  underscore = _ = require('underscore'),
  parse = require('url').parse;

var Router = module.exports = Backbone.Router;

var handler = Router.handler = new RouteHandler;

// router prototype. Meant to override specific part of
// Backbone.Router.prototype

//
// Manually bind a single named route to a callback. For example:
//
//    this.route('search/:query/p:num', 'search', function(query, num) {
//      ...
//    });
//
Router.prototype.route = function(route, name, callback) {
  var parts = route.split(' '),
    method = parts.shift().toLowerCase();

  route = parts.shift();
  if(!route) route = method, method = 'get';

  // handle trailing slash
  route = /^\//.test(route) ? route : '/' + route;
  if (!_.isRegExp(route)) route = this._routeToRegExp(route);
  if (!callback) callback = this[name];

  var self = this;
  handler.route(this, method, route, function(req, res, next) {
    var args = self._extractParameters(route, req.url);

    // Attach current req, res, next to the router instance,
    // to hook into middleware logic and eventually end the response.
    //
    // Last argument of action handler is **always** the options object,
    // with req, res and next attached.
    req.req = req;
    res.next = next;
    args = args.concat(res);

    // invoke each registered middleware for this router and path
    self.middlewares(route, req, res, function(e) {
      if(e) return next(e);

      // invoke route handler if provided
      callback && callback.apply(self, args);

      // trigger appropriate events
      self.trigger.apply(self, ['route:' + name].concat(args));
      handler.trigger('route', this, name, args);
    });
  });

  return this;
};


// **use** a given middleware and setup the middleware to stack
// to run through before reaching routes. A `path` may be provided
// to register the middleware only for a given route pattern.
Router.prototype.use = function use(path, cb) {
  if(!cb) cb = path, path = '/';

  // handle trailing slash
  path = /^\//.test(path) ? path : '/' + path;
  if (!_.isRegExp(path)) path = new RegExp('^' + path);
  var stack = this._middlewares || (this._middlewares = []);
  stack.unshift({ route: path, callback: cb });
};

// **middlewares** Go through the registered stack of middlewares for
// the given `route` pattern before executing provided `cb` callback.
Router.prototype.middlewares = function middlewares(route, req, res, cb) {
  var stack = this._middlewares;
  if(!stack || !stack.length) return cb();

  stack = stack.filter(function(middleware) {
    return middleware.route.test(route);
  });

  (function next(middleware) {
    if(!middleware) return cb();
    middleware.callback(req, res, function(e) {
      if(e) return cb(e);
      next(stack.shift());
    });
  })(stack.shift());
};


//
// Router Handler - sever-side equivalent of `Backbone.History`
//

function RouteHandler() {
  this.handlers = [];
}

_.extend(RouteHandler.prototype, Events, {

  // Add a route to be tested when a request comes in. Routes added
  // later may override previous routes.
  route: function route(router, method, path, callback) {
    method = method.toUpperCase();
    this.handlers.unshift({ router: router, method: method, route: path, callback: callback });
  },

  // Attempt to match a route for given `req`, testing it against
  // `req.url`, `req.method` and `root` mounted-point.
  match: function match(root, req) {
    if(!req) req = root, root = '/';
    var url = parse(req.url);
    return _.find(this.handlers, function(handler) {
      var method = handler.method === req.method;
      return method && handler.router.root.test(url.pathname) && handler.route.test(url.pathname);
    });
  },

  // handler for incoming request, test `req.url` against each
  // registered route.
  handle: function handle(root, req, next) {
    var route = this.match(root, req);
    next(null, route);
    return this;
  }

});



