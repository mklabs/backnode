    
## express example

Quick sample and tests at working with express app.

## browserify

Implement and see how browserify could provide a really handy way of reusing node modules on client.

Backbone is known as fully compatible.


## Source code tutorial

like https://github.com/arturadib/hello-backbonejs http://arturadib.com/hello-backbonejs

Maybe something like:

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

#### docs

##### error

* how to set up error handling using connect.middleware
* UrlError and how it hooks in errorHandler to output the list of registered routers
* Named function expression and name router property for better error report.
* configure and override error.html.

##### views

and template inheritence.

##### sync and persistence

middleware could accept a store property which would be an object implementing the following api which is the CRUD methods that Backbone.Sync expects (method – ("create", "read", "update", or "delete")):

    create: function create(model, options) {},
    read: function read(model, options) {},
    update: function update(model, options) {},
    delete: function delete(model, options) {}
    
`options` is an hash object with `success` and `error` callback attached.

no return value, use of options.success or options.error to pass control flow.

success should be called with a json object (or an array of json object in case of collections) that is parsed by the `parse` method of Models and Collections (default is noop, simply returning the json object).

note: api could be the following to adopt more the node convention:

    read: function read(model, callback) {}
    
with callback: `function(err, args*) {}`. The first argument is the error object, pass null if success and any other arguments. Usually a json object or an array.

stores could use the eventemitter style if instance of events.EventEmitter. In the following example, the read method use the emit method only if no callback if provided.

    read: function(model, callback) {
      db.find(model.id, function(err, data) {
        if(err) return callback ? callback(err) : this.emit('error', err);
        callback ? callback(null, data) : this.emit('success', data);
      })
      return this;
    }
    
    // Usage
    Store.read(model)
      .on('error', function() { process.exit(1); })
      .on('success', function(data) {
        console.log('Yay success, model is ', data);
      });
      
    // Usage callback style
    Store.read(model, function(err, data) {
      if(err) process.exit(1);
      console.log('Yay success, model is ', data);
    });

##### notes
Kinda takes a different approach than starting from client-side code and see how we could reuse them on the server (namely models). Instead, it focus more on server-side use of backbone, then thinking on re-using most of the code base on the client-side.