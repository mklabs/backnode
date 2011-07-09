# Backnode

*needs to implement, following is a description of what backnode may look like*

What is Backnode... Like is name tends to introduce, it's somewhat a silly copy of the fantastic Backbone library, a mimick of its API on the server side.

This is a quick implementation, so it may break. I want to develop this for personal use, and for funny experiments, so it hasn't been fully tested against other use-cases.

Backnode hooks in the request/response paradigm in node using either connect or express. It's bundlded and designed as a connect middleware.

## Installation

    git clone https://github.com/mklabs/backnode
    cd backnoe
    npm link

cd to any other directory, at the root of your project, run

    npm link
    
or just create a node_modules folder at the root of the repo and git clone into it.

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
* Views: commenting in View constructor `ensureElements` and `delegatesEvent` do the trick.
  * Views are completely overiden using extends/inherits technique from Backbone source, we provide our own View.
* Model Persitence: quick test at syncing from the filesystem. Had to expose the whole Backbone lib to be able to override Backbone.Sync.
* Components needs access to req/res/next namely to end reponse and to pass control over next middlewares, router and views get attached these objects upon each requests. Views must attached to Routers to get access to these.

## Notes

* Backnode goals it to mimic the Backbone API and provides a Backbone way of doing things in node.
* Makes few assumptions of what you need and don't when there is no DOM (no events delegation for Views, 
no model/view auto re-rendering when model changes, ...). On the other hand, on the server-side, you'll most likely need some sort of layout management and rendering (view compositions). Would be nice to have something that relies on Class and Inheritence to provide basic template inheritence.
* This is quick implementation
* So far, sounds pretty cool to implement a node app using Backbone to handle not only models (and validations and so on), but also request handling using regular Routers and view rendering using a slight variation of Backbone's.

## Basic Usage

##### and desired API

```javascript
// ## Backnode example

// This is a quick implementation of basic example of what a backnode app could look like

var Backnode = require('backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Mustache = require('mustache'),
md = require('github-flavored-markdown').parse,
fs = require('fs');

// Router - handle incoming request
var Router = Backnode.Router.extend({
  routes: {
    'about':  'about',
    'search/:page/p:query': 'search'
  },

  // constructor/initialize. ex: new Router([options])
  initialize: function initialize() {
    console.log('Initialize: ', this.routes, arguments);

    // model may be Collections as well
    this.model = new Pages();
    this.view = new PageView({model: this.model});
  },

  about: function about() {
    // action, do something, usually generates response and res.end
    this.model.doSomething();
    this.view.render();
  },

  search: function search(page, query) {
    console.log('Search actions: ', this.model);
    this.res.end('Search actions' + page + query);
  }
});

// PageView - Backbone.View

// Get started with views by creating a custom view class. You'll want to override the render function, 
// specify your template string.
var PageView = Backnode.View.extend({

  // Cache the template function for a single page.
  template: function template(data) {
    return Mustache.to_html(this.templateStr, data); 
  },

  initialize: function initialize(options) {
    // usually a filesystem call to get template string content.
    // If Views are initialized at server startup time, sync calls are fine

    this.templateStr = fs.readFileSync('page.html').toString();
  },

  // render - end the response or call this.next()
  render: function render(model) {
    model = model || this.model;

    // model must be a collection (to use the same template)
    model = model instanceof Backnode.Model ? new Pages(model) : model;
    this.res.end(this.template(model.toJSON()));
  }
});

var Page = Backnode.Model.extend({
  toJSON: function toJSON() {
    var page = Backnode.Model.prototype.toJSON.apply(this, arguments);        
    page.content = md(page.content);
    return page;
  }
});


var Pages = Backnode.Collection.extend({
  model: Page,

  // when created (at server startup), get the list of all pages from the file system
  // and init the collection. Only called once, and on server startup, go sync
  initialize: function() {
    this.fetch();
  },

  toJSON: function() {
    var json = Backnode.Collection.prototype.toJSON.apply(this, arguments);    
    return {
      title: 'Backbone on top of Connect for delicious applications',
      pages: json
    };
  },

  getFile: function(file) {
    return this.filter(function(page) {
      return page.get('file') === file;
    })[0];
  },

  comparator: function(page) {
    return page.get('file');
  }
});

// Override `Backbone.sync`

// The method signature of Backbone.sync is sync(method, model, [options])

// * method – the CRUD method ("create", "read", "update", or "delete")
// * model – the model to be saved (or collection to be read)
// * options – success and error callbacks

Backbone.sync = function(method, model, options, error) {
  if(method === "read") {
    // impl something
  } else if(method === "create") {
    
  } else if(method === "update") {
    
  } else if(method === "delete") {
    
  }
};


// a basic connect stack with a backnode middleware
// it is the server version of a $(function() { new Router(); Backbone.history.start(); })
connect.createServer()
  .use(connect.logger())
  .use(Backnode(new Router))
  .use(connect.directory(__dirname))
  .use(connect.static(__dirname))
  .listen(4000);
```

## Complete (or nearly)

* Router: basic routing feature using Backbone API, routing done using connect.router middleware.
	* params from req.params are retrieved from the request and pass to the handler function when invoked (`action: function(param, secondParam){}`)
	* router instance is given req, res object and next function. Updated on incoming request.
		* ex to end the response from a router: this.res.end('Response ended');
* Views: Views are not templates themselves. They're a control class that handles the presentation for a model. However, in a node context, They don't take tag, el, className, ...
* Models & Collections: As long as Backbone.sync is correctly implemented (example in this repo use the filesystem), works pretty fine.


## Special Thanks

* [Backbone](https://github.com/documentcloud/backbone) [authors](https://github.com/jashkenas)
* [connect](https://github.com/senchalabs/connect)/[express](https://github.com/visionmedia/express) authors
* node.. ♥ ♥ ♥