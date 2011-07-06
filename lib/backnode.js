
var Backbone = require('backbone'),
_ = require('underscore'),
connect = require('connect'),
Path = require('path');

// main entry point. version: 0.0.0.0.0.0.0.1

// Main middleware

exports = module.exports = function Backnode(Router) {

	var router = new Router(),
	routes = router.routes,
	keys = Object.keys(routes);
	
	// "search/:query/p:page": "search"
	
	// From the router routes, build connect router
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
				
				// also attach on views? should force the view attachment to router?
				// router.view.req = res; ...
				if(router.view) {
					router.view.req = req;
					router.view.res = res;
					router.view.next = next;
				}
				
								
				router[action].apply(router, args);
			}
			
						
			// get by default for now.
			// todo: implement other verbs. ex: a route 'POST /route'
			app.get(path, fn);
		});
	});
};

exports.Router = Backbone.Router;

exports.Model = Backbone.Model;

exports.View = Backbone.View;

