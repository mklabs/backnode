## Documentation

In this folder, you'll find a simple Backnode tutorial comprised of a set of example of increasing complexity. It is designed to provide a concrete overview of what it's like to use Backbone on the server-side and how Backnode differs from client side Backbone use. 

This tutorial starts with a minimalist Getting Started guide, then dives into Router, Model, Collection, Views, and Persistence strategy and Backbone.sync overrides.


1. Getting started
  1. basic Router (no view, no model). Just ending the response.
  * typical connect server + backnode middleware
  * Introducing views (+template special property, how it differs from standard backbone view)
  * Introducing models (really just like normal backbone model)
  * Using it all togeter. Router deal with model/views instantiation, calling appropriate model methods then view render method. Views gets passed a model at instantiation.
2. Router
  1. req.params as action arguments
  2. current req/req/next as instance properties. updated by the backnode middleware.
  3. Dealing with errors (and `this.next`)
3. Models
  1. just as backbone ones
  2. collections
  3. example using several collection, model methods
  4. Speaking of syncing (persistence strategy)
4. Views
  1. Basic view (and relation to template files)
  2. Template inheritance
  3. Rendering response (this.req, res, next available)
5. Backbone.sync override and persistence stratehy
  1. in memory
  2. filesystem
  2. mongodb
  3. couchdb
  4. redis
  5. request (server-to-server requests)
  6. ...
6. Concrete and complete example (say yet another blog tutorial application)

_This documentation is heavily inspired by [Hello Backbone.js](http://arturadib.com/hello-backbonejs/)._