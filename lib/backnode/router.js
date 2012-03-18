
var router = module.exports,
  Backbone = require('backbone'),
  underscore = _ = require('underscore'),
  parse = require('url').parse;

var router = module.exports = new Router;

// router prototype. Meant to override specific part of
// Backbone.router.prototype
var proto = router.proto = {};

//
// Manually bind a single named route to a callback. For example:
//
//    this.route('search/:query/p:num', 'search', function(query, num) {
//      ...
//    });
//
proto.route = function(route, name, callback) {
  var parts = route.split(' '),
    method = parts.shift().toLowerCase();

  route = parts.shift();
  if(!route) route = method, method = 'get';

  // handle trailing slash
  route = /^\//.test(route) ? route : '/' + route;

  if (!_.isRegExp(route)) route = this._routeToRegExp(route);
  if (!callback) callback = this[name];

  var self = this;
  router.route(method, route, function(req, res, next) {
    var args = self._extractParameters(route, req.url);

    // Attach current req, res, next to the router instance,
    // to hook into middleware logic and eventually end the response.
    //
    // Last argument of action handler is **always** the options object,
    // with req, res and next attached.
    req.req = req;
    res.next = next;
    args = args.concat(res);
    callback && callback.apply(self, args);
    self.trigger.apply(self, ['route:' + name].concat(args));
    router.trigger('route', this, name, args);
  });

  return this;
};


//
// Router Handler - sever-side equivalent of `Backbone.History`
//

function Router() {
  this.handlers = [];
}

_.extend(Router.prototype, Backbone.Events, {

  // Add a route to be tested a request comes in. Routes added later may
  // override previous routes.
  route: function route(method, path, callback) {
    method = method.toUpperCase();
    this.handlers.unshift({ method: method, route: path, callback: callback });
  },

  // Attempt to match a route for `req.url`
  match: function match(url) {
    return _.find(this.handlers, function(handler) {
      return handler.route.test(url.pathname);
    });
  },

  // handler for incoming request, test `req.url` against each 
  // registered route.
  handle: function handle(req, next) {
    var route = this.match(parse(req.url));
    next(null, route);
    return this;
  }

});



