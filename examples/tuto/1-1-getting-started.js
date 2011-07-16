// **This example illustrates the declaration and instantiation of a minimalist Router**

// <a href="1-2-introducing-views.html" class="button">Go to Introducing views</a>

// Get started by creating a custom router class. You'll want to define actions that are triggered when certain URL fragments are matched, and provide a routes hash that pairs routes to actions.

var Backnode = require('backnode'),
connect = require('connect');

// **Router class**: Our main app router.
var Router = Backnode.Router.extend({
  // `routes`: hash internally used by the Backnode middleware. A corresponding set of routes is created using `connect.router` api.
  // The routes hash maps URLs with parameters to functions on the router. 
  routes: {
    '':                     'index',
    'user/:id':             'user',
    'search/:page/p:query': 'search'    
  },

  // `index()`: Function in charge of handling the incoming request. This ones is triggered on `/` url.
  index: function() {
    // Router instances gets the `request`/`response` object (so as `next()`) as instance property and are kept up to date with the currently running request.
    this.res.end('Hi, im index action.');
  },
  
  // `user()`: triggered on `/user/2` url. It gains request parameters as defined by url parameter parts.
  user: function(id) {
    this.res.end('Asking user ' + id);
  },
  
  // `search()`: triggered on `/search/onepage/p7` url. It gains request parameters as defined by url parameter parts.  
  search: function(page, query) {
    this.res.end('Searching with page: ' + page + ', query: ' + query);
  }
});


// **create the connect server with basic configuration.** Router is passed in Backnode middleware which creates and returns a `connect.router` with matching routes.
connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(new Router))
  .use(connect.static(__dirname))
  .listen(8080);

console.log('Server started, up and running on port 8080');

