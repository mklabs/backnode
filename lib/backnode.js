
var Backbone = require('backbone'),
_ = require('underscore'),
connect = require('connect'),
fs = require('fs'),
Path = require('path');

// ##### main entry point. version: 0.0.0.0.0.0.0.1

// ### Main middleware


// module-scoped routes caches, useful to return the list of registred routes.
var _routes = [];

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
    this.req = req;
    this.res = res;
    this.next = next;
    
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
        var args = [], 
        params = req.params, 
        cb = router[action],
        handler;
        
        for(var p in req.params) {
          args[args.length] = req.params[p];
        }
								
        // on each request, attach req, res, next to router instance
        router.trigger('request', req, res, next);
        
        if(!_.isFunction(cb)) {
          // route fragment matched but not action to handle the request
          return next(new Backnode.UrlError('Found a route matching but no action'));
        }
        
        return router[action].apply(router, args);
      };
			
						
      // GET by default for now.
      // *TODO: implement other verbs. ex: a route `POST /route`*
      
      // connects given the compiled regexp of our path to comply with Backbone splat params. We use the internal `routeToRegExp` method.
      app.get(router._routeToRegExp(path), fn);
      handler = _.isFunction(router[action]) ? (router[action].name || 'anonymous') : '((Warn: no request callback for this route))';
      handler = router.name ? router.name + '.' + handler : handler;
      _routes[_routes.length] = 'GET '+ path + ' {{' + handler + '}}';
    });
  });
};

// ### Backbone components

// #### Backbone object
// exposed mainly for Backbone.sync override
Backnode.Backbone = Backbone;

// #### Underscore
Backnode._ = Backnode.underscore = _;

// #### Router
Backnode.Router = Backbone.Router;

// #### Model
Backnode.Model = Backbone.Model;

// #### Collection
Backnode.Collection = Backbone.Collection;

// #### Backnode.View
//
// Creating a Backnode.View creates a Backbone.View like class without DOM-related code
//
// The template property has special purpose in Backnode. View instances get template
// contents, computed by the `_attchView` method. Templates are specified with the
// `template` property, if the View extends another View with a template property, the
// resulting template value would be a single template string, where each template 
// is nested depending on the `{{layout}}` placeholder that get replaced by the 
// preceding template content.
Backnode.View = function(options) {
  this.cid = _.uniqueId('view');
  this._configure(options || {});
  this._attachView(this.template);
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
  },
  
  // Performs the initial template configuration of a View.
  // A `template` property must be specified, which value is the
  // relative path to the template file that will get attach to the
  // View instance.
  //
  // This is a one-time hit, so we can afford to be sync.
  //
  _attachView: function(file) {
    if(!file) throw new Error('A "file" property must be specified');
    var views = [],
    placeholder = this.placeholder || '{{layout}}';
    
    (function viewRecurse(view) {
      var parent = view.constructor.__super__;
      
      views[views.length] = view.template;
      if(parent && parent.template) {
        viewRecurse(view.constructor.__super__); 
      }
      
    })(this);
    
     
    this.template = _.reduce(views, function(memo, file) {
      var template = fs.readFileSync(file, 'utf8');
      memo = memo || placeholder;
      return template.replace(placeholder, memo, 'g');
    }, '');
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


// Error helper
Backnode.UrlError = function UrlError(msg) {
  
  this.stack = _routes.join('\n').replace(/(GET[^\{]+)/g, function(whole, match) {
    return '<b>' + match + '</b>';
  });
  
  this.stack = this.stack.replace(/\{\{(.+)\}\}/g, function(whole, match) {
    return '<span style="float: right; width: 60%;">' + match + '</span>';
  });
  
  this.stack = this.stack.replace(/\(\((.+)\)\)/g, function(whole, match) {
    return '<em style="color: red; font-size: 0.9em;">' + match + '</em>';
  });
  
  this.message = msg || ': ((';
};

_.extend(Backnode.UrlError.prototype, {
  toString: function(){
    return this.message;
  }
});

