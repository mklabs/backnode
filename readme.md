# Backnode

*needs to implement, following is a description of what backnode may look like*

What is Backnode... Like is name tends to introduce, it's somewhat a silly copy of the fantastic Backbone library, a mimick of its API on the server side.

This is a quick implementation, so it may break. I want to develop this for personal use, and for funny experiments, so it hasn't been fully tested against other use-cases.

Backnode hooks in the request/response paradigm in node using either connect or express. It's bundlded and designed as a connect middleware.

## Installation

once npm published

	npm install backnode

## Motivation

* JavaScript everywhere and consistent API between client/server side code
* Easy way to get Model, Views, Router (formerly Controller) backbone in express apps.
* Leverage the pushState paradigm while staying accessible and SEO compliant. Browsers that supports pushState get nice transitions and single-page transparently (just feels faster, no #-ish), others just asks server html response. (and xhr request get template model as json data). Server knows what response to generate base on basic content-negotiation.
* Code sharing between the two (as far as it makes sense)
	* Model, Views ?
	* Templates & Views
	* ???
* Backbone-Router like interface to handle incoming request
* Provides just enough level of abstraction to use Backbone features and principles in node
	* no fancy real-time infrastructure (already plenty of awesome projects on that), goal is just about handling incoming request and generating a response
* template engine agnostic: just as backbone, the goal is to be able to use any templating engine that takes
some template string (with an eventual compilation step), data and returns a new string.

## Things to be done

* prety much everything

##### and problems to be solved

* There's no DOM. Router, Model actually can live outside of a browser scope as is, no direct dependencies on document or other stuff. That's not the case of Views, may need a rewrite from the bottom-up.

## Notes

* Backnode goals it to mimick the Backbone API and provides a Backbone way of doing things in node.
* Makes few assumptions of what you need and don't when there is no DOM (no events delegation for Views, 
no model/view auto re-rendering when model changes, ...). On the other hand, on the server-side, you'll most likely need some sort of layout management and rendering (view compositions). Would be nice to have something that relies on Class and Inheritence to provide basic template inheritence.
* This is quick implementation

## Basic Usage

##### and desired API

```javascript
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
		this.model = new Page();
		// this.view = new PageView({model: this.model});
	},

	about: function() {
		// action, do something, usually generates response and res.end
	},

	search: function(page, query) {
		console.log('Search actions: ', this.model);

		this.res.end('Search actions' + page + query);
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
		this.templateStr = fs.readfileSync('page.html').toString();
	},

	render: function() {
		// end the reponse
		this.res.render(this.template(this.model.toJSON()));

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
```




## Complete (or nearly)

* Router: basic routing feature using Backbone API, routing done using connect.router middleware.
	* params from req.params are retrieved from the request and pass to the handler function when invoked (`action: function(param, secondParam){}`)
	* router instance is given req, res object and next function. Updated on incoming request.
		* ex to end the response from a router: this.res.end('Response ended');
		




## Special Thanks

ThxThxThx

* Backbone authors
* connect/express authors
* node