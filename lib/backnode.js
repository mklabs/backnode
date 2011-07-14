
var Backbone = require('backbone'),
_ = require('underscore'),
connect = require('connect'),
fs = require('fs'),
Path = require('path');

// ##### main entry point. version: 0.0.0.0.0.0.0.1

// ### Main middleware

var Backnode = module.exports = function Backnode(router) {
  
  if(!(router instanceof Backbone.Router)) {
    throw Error('router must be a Backbone.Router instance');
  } 
  
  var routes = router.routes,
  keys = Object.keys(routes);
	
  // another way of dealing with req/res/next problem in views is to rely
  // on Backbone.Events (or EventEmitter) to trigger a callback function that gets
  // current req/res/next as params. Iterate over router instance properties,
  // if any props is an instance of Backnode.View, attach attach
  router.bind('request', function(req, res, next) {
    _.each(this, function(prop, key) {
      if(prop instanceof Backnode.View) {
        this[key].req = req;
        this[key].res = res;
        this[key].next = next;
      }
    }, this);
  });
  
  // From the router's routes, build connect router
  return connect.router(function(app) {
    keys.forEach(function(route) {
      var path = Path.join('/', route),
      action = routes[route],
      fn = function(req, res, next) {
        var args = [];				
        for(var p in req.params) {
          args[args.length] = req.params[p];
        }
								
        // on each request, attach req, res, next to router instance
        router.req = req;
        router.res = res;
        router.next = next;
				
        router.trigger('request', req, res, next);
								
        router[action].apply(router, args);
      };
			
						
      // GET by default for now.
      // *TODO: implement other verbs. ex: a route `POST /route`*
      app.get(path, fn);
    });
  });
};

// ### Backbone components

// #### Backbone object
// exposed mainly for Backbone.sync override
Backnode.Backbone = Backbone;

// #### Router
Backnode.Router = Backbone.Router;

// #### Model
Backnode.Model = Backbone.Model;

// #### Collection
Backnode.Collection = Backbone.Collection;

// #### Backnode.View

// Creating a Backnode.View creates a Backbone.View version without DOM-related code

// _**ideas: could use a template property which could either be a valid path to a template view
// or a template string directly. If it's a path, we could make the fs call to remove
// a little cruft.**_
Backnode.View = function(options) {
  this.cid = _.uniqueId('view');
  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

// List of view options to be merged as properties.
var viewOptions = ['model', 'collection', 'attributes', 'req', 'res', 'next'];

// Set up all inheritable **Backbone.View** properties and methods.
_.extend(Backnode.View.prototype, Backbone.Events, {

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize : function(){},

  // **render** is the core function that your view should override, in order
  // to render its template view, with the appropriate HTML. The
  // convention is for **render** to always either either ending response or 
  // passing control over next middlewares
  render : function() {
    return this;
  },

  // Performs the initial configuration of a View with a set of options.
  // Keys with special meaning *(model, collection, id, className)*, are
  // attached directly to the view.
  _configure : function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = viewOptions.length; i < l; i++) {
      var attr = viewOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  }

});

// #### Set up inheritance for the view.
// This is coming from backbone source, needed to be able to change the View constructor
// and to keep Backbone prototype chaining sugar.

// Shared empty constructor function to aid in prototype-chain creation.
var ctor = function(){};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
Backnode.View.extend = function extend(protoProps, classProps) {
  var child, parent = this;
  
  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call `super()`.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
   child = protoProps.constructor;
  } else {
   child = function(){ return parent.apply(this, arguments); };
  }

  // Inherit class (static) properties from parent.
  _.extend(child, parent);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(child.prototype, protoProps);

  // Add static properties to the constructor function, if supplied.
  if (classProps) _.extend(child, classProps);

  // Correctly set child's `prototype.constructor`.
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed later.
  child.__super__ = parent.prototype;
  
  
  child.extend = this.extend;
  return child;
};

