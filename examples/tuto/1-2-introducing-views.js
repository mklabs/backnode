// **This example illustrates the declaration and instantiation of a simple View**

// <a href="1-3-introducing-models.html" class="button">Go to Introducing models</a>

// Just as routers, View instances get request/response/next to manipulate the response or optionnally pass control over the next middleware. _Note that they're correctly sey up if the view is attached to the corresponding Router, usually done in the Router's initialize method._

var Backnode = require('backnode'),
connect = require('connect');


// **View class**: Our main app view.
var View = Backnode.Router.extend({
  // templates are internally (when instantiated) resolved as the file content. The value specified is the relative path to the template file.
  template: 'templates/index.html',
  
  // `render()`: Function in charge of handling the response output. Views generally defines a render method to end the response. Potentially, any template engine could be used. Here, we only replace the `{{foobar}}` hook with value.
  render: function() {
    this.res.end(this.template.replace('{{foobar}}', 'Foobar'));
  }
});

// **Router class**: Our main app router.
var Router = Backnode.Router.extend({
  routes: {
    '': 'index'
  },
  
  // `initialize()`: This is where the View is instantiated. Usually, it gets attached to the instance property to easily acces them later in actions. Plus, this is mandatory for views to be able to acts on a response object. If any of the Router property is a View, they get request/response/next and are kept up to date upon each incoming request. 
  initialize: function() {
    this.view = new View();
  },

  // `index()`: Now that we have a view to work with, call its render method to end the response. Remember that actions must either end the response or `this.next()` to the following middleware, otherwise the request will hang out indefinitely.
  index: function() {
    this.view.render();
  }
});

connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(new Router))
  .use(connect.static(__dirname))
  .listen(8080);

console.log('Server started, up and running on port 8080');

