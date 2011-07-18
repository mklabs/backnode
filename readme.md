# Backnode

**Experiment on making Backbone usable in Node**. 

It has special handling on Router and Views so that they can be used outside of the browser where there's no DOM and living document but request/response.

Backnode hooks in the request/response paradigm using either [connect](http://senchalabs.github.com/connect/) or [express](http://expressjs.com/). It's bundled and designed as [a connect middleware](https://github.com/mklabs/backnode/blob/master/lib/backnode.js).

The middleware lets you use a Backbone Router to handle incoming requests, the connect middleware uses the router instance passed in and create the according `connect.router` and routes under the hood. Request parameters are added as arguments function.
    
Backnode also provides some special handling for [Views](https://github.com/mklabs/backnode/wiki/Views), namely a simple but quite flexible template inheritance. Actually, in the context of server-side use, there is no DOM and Views responding to Model changes. It's all about responding to requests, and generating a response on top of the current model state.

[Stores](https://github.com/mklabs/backnode/wiki/Stores) are adapters used internally by Backbone.sync, the function that Backbone calls every time it tries to read or save a model.

## Installation

    git clone git://github.com/mklabs/backnode.git
    cd backnode
    npm link

cd to any other directory, at the root of your project, run

    npm link backnode
    
or just create a node_modules folder at the root of the repo and git clone into it.


## Documentation

The [wiki](https://github.com/mklabs/backnode/wiki) contains more information. Documentation is growing and changing as the development and testing evolve.

* [Views and template inheritance](https://github.com/mklabs/backnode/wiki/Views)
* [Views](https://github.com/mklabs/backnode/wiki/Views) - intro, template engine and how to use template inheritance
* [Stores](https://github.com/mklabs/backnode/wiki/Stores) - persistence strategy, backbone.sync and how to use Store adapters
* [Error handling](https://github.com/mklabs/backnode/wiki/Error-handling) - connect.errorHandler basic usage and custom route error page

There's also few sample apps in `examples` folder, namely the sync one where the same app.js is used to test different stores (and see how to do it. needs further work, tests, optimization.. but basic sync of models with adapters for [memory](https://github.com/mklabs/backnode/blob/master/examples/sync/memory/store.js), [mongodb](https://github.com/mklabs/backnode/blob/master/examples/sync/mongo/store.js), [couchdb](https://github.com/mklabs/backnode/blob/master/examples/sync/couch/store.js)).

## Basic usage

    
    var Backnode = require('backnode'),
    connect = require('connect');
    
    var Router = Backnode.Router.extend({
      routes: {
        '':                     'index',
        'user/:id':             'user',
        'search/:page/p:query': 'search'    
      },

      index: function() {
        this.res.end('Hi, im index action.');
      },

      user: function(id) {
        this.res.end('Asking user ' + id);
      },
      
      search: function(page, query) {
        this.res.end('Searching with page: ' + page + ', query: ' + query);
      }
    });


    connect.createServer()
      .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
      .use(Backnode(new Router))
      .use(connect.static(__dirname))
      .listen(8080);

    console.log('Server started, up and running on port 8080');


## Motivation

* JavaScript everywhere and consistent API between client/server side code
* Easy way to get Model, Views, Router (formerly Controller) backbone in express/connect apps.
* Backbone-Router like interface to handle incoming request.
* Provides just enough level of abstraction to use Backbone features and principles in node
	* no fancy real-time infrastructure (already plenty of awesome projects on that), goal is just about handling incoming request and generating a response
* template engine agnostic: just as backbone, the goal is to be able to use any templating engine that takes
some template string (with an eventual compilation step), data and returns a new string.
* persistence strategy: Backbone.sync make it easy to use a different persistence layer every time it tries to read or save a model. The goal is to be able to use Models and Collections with a persistence strategy designed for a server-side use, such as the Mongo, Couch, Redis, or even the filesystem. 


## Special Thanks

* [Backbone](https://github.com/documentcloud/backbone) [authors](https://github.com/jashkenas)
* [connect](https://github.com/senchalabs/connect)/[express](https://github.com/visionmedia/express) authors
* node.. ♥ ♥ ♥