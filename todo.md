    
## express example

Quick sample and tests at working with express app.

## browserify

Implement and see how browserify could provide a really handy way of reusing node modules on client.

Backbone is known as fully compatible.


## Source code tutorial

like https://github.com/arturadib/hello-backbonejs http://arturadib.com/hello-backbonejs

Maybe something like:

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


##### middleware should be able to work with one or more router instances

needs to be able to give middleware several router instance

    .use(Backnode(new Home, new Admin, etc))
    

This is already possible though

    .use(Backnode(new Home))
    .use(Backnode(new Admin))

##### Views docs

All the Layout file have to do is to provide a “hook”, a placeholder which specifies where the main View output (which is defined by the nested templates) should be placed. The default placeholder is ``{{layout}}`` but may be set to anything else using the `placeholder` property per view.

Template inheritance is a powerful concept that allows us to create complex web pages by reusing common parts.

* write about fundamental differences from backbone client app (no el, className, etc.).

##### notes
Kinda takes a different approach than starting from client-side code and see how we could reuse them on the server (namely models). Instead, it focus more on server-side use of backbone, then thinking on re-using most of the code base on the client-side.