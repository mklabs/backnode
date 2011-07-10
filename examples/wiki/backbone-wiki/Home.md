# Backnode

*needs to implement, following is a description of what backnode may look like*

What is Backnode... Like is name tends to introduce, it's somewhat a silly copy of the fantastic Backbone library, a mimick of its API on the server side.

This is a quick implementation, so it may break. I want to develop this for personal use, and for funny experiments, so it hasn't been fully tested against other use-cases.

Backnode hooks in the request/response paradigm in node using either connect or express. It's bundlded and designed as a connect middleware.

## Installation

    git clone https://github.com/mklabs/backnode
    cd backnode
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

###### and problems to be solved

* There's no DOM. Router, Model actually can live outside of a browser scope as is, no direct dependencies on document or other stuff. That's not the case of Views.
* Views: commenting in View constructor `ensureElements` and `delegatesEvent` do the trick.
  * Views are completely overiden using extends/inherits technique from Backbone source, we provide our own View.
* Model Persitence: quick test at syncing from the filesystem. Had to expose the whole Backbone lib to be able to override Backbone.Sync.
* Components needs access to req/res/next namely to end reponse and to pass control over next middlewares, router and views get attached these objects upon each requests. Views must be attached to Routers to get access to these.


###### Complete (or nearly)

* Router: basic routing feature using Backbone API, routing done using connect.router middleware.
	* params from req.params are retrieved from the request and pass to the handler function when invoked (`action: function(param, secondParam){}`)
	* router instance is given req, res object and next function. Updated on incoming request.
		* ex to end the response from a router: this.res.end('Response ended');
* Views: Views are not templates themselves. They're a control class that handles the presentation for a model. However, in a node context, They don't take tag, el, className, ...
* Models & Collections: As long as Backbone.sync is correctly implemented (example in this repo use the filesystem), works pretty fine.

## Notes

* Backnode goals it to mimic the Backbone API and provides a Backbone way of doing things in node.
* Makes few assumptions of what you need and don't when there is no DOM (no events delegation for Views, 
no model/view auto re-rendering when model changes, ...). On the other hand, on the server-side, you'll most likely need some sort of layout management and rendering (view compositions). Would be nice to have something that relies on Class and Inheritence to provide basic template inheritence.
* This is quick implementation

###### this.res.end('Backbone  ♥ Node  ♥');