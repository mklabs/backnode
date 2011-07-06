	
// ## Backnode example

// This is a quick implementation of basic example of what a backnode app could look like

// Needs to figure out - 
// how do we hook up in the request/response lifecycle time? 
// in connect, express apps, actions gets request, response, next as funcion parameters
// and would break Backbone API. May we put according object req/res/next (and taking care of updating
// references for each request, will be overkill, performance-costly? may use EventEmitter for that
// at the middleware level.)

// we basically needs a way to acces them, one way or another. needs acess to request, response object, 
// namely for being able to end the response. needs access to next() method as well, important to pass request
// to following middleware if the response is not ended.

// if the setup of req/res/next is done using class attributes, do we need to put them in Router(at least), Views
// and Models? Models pretty sure that we shouldn't.

// Error handling, cannot just throw. Use of this.next(err);

var Backnode = require('backnode'),
connect = require('connect'),
Mustache = require('mustache'),
fs = require('fs');

var Router = Backnode.Router.extend({
	routes: {
		'about':             	'about',    // /about
		'blog/:post':        	'post',  	// /blog/blog-post
		'blog/tag/:tag': 		'tag',   	// /blog/tag/node
		'search/:page/p:query': 'search'
	},
	
	initialize: function() {
		console.log('Initialize: ', this.routes, arguments);
		// constructor/initialize new Router([options])
		
		// model may be Collections as well
		this.model = new Page({content: '## foo\n barr', title: 'foobar'});
		this.model.set({foobar: 'totallyfoobar'});
				
		this.view = new PageView({model: this.model});
		
	},
	
	about: function() {
		// action, do something, usually generates response and res.end
	},
	
	search: function(page, query) {
		console.log('Search actions: ', this.model, this.view);
				
		this.view.render();
	},
	post: function(post) {},
	tag: function(tag) {}
});


// will have to override sync, when fetching/saving we no longer
// issues REST request to talk to the server, we already are the server

// Instead, could think of various adapters to handle persistence (mongo
// redis, couch, in memory, filesystem, ...)
var Page = Backnode.Model.extend({});

// PageView - Backbone.View

// Get started with views by creating a custom view class. You'll want to override the render function, 
// specify your template string.
var PageView = Backnode.View.extend({

	// Cache the template function for a single page.
	template: function(data) {
		return Mustache.to_html(this.templateStr, data); 
	},
	
	initialize: function(options) {
		// usually a filesystem call to get template string content.
		// If Views are initialized at server startup time, sync calls are fine
				
		// otherwise, could be wise to scans the entire package at startup, compile views and keeps
		// reference to either compiled function or template string for later use
		this.templateStr = fs.readFileSync('page.html').toString();
	},

	render: function() {
		// end the reponse
		console.log('Model: ', this.model.toJSON());
		this.res.end(this.template(this.model.toJSON()));
		
		// or call next middlewares...
		// this.next();
	}
});


// a basic connect stack with a backnode middleware
// it is the server version of a $(function() { new Router(); Backbone.history.start(); })
connect.createServer()
	.use(connect.logger())
	.use(Backnode(Router))
	.use(connect.directory(__dirname))
	.use(connect.static(__dirname))
	.listen(4000);


