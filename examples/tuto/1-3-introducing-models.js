
// **This example illustrates how to use a Models to store data, and how to tie changes in those to a View.**

// <a href="1-4-using-it-all-together.html" class="button">Using it all togeter</a>

var Backnode = require('backnode'),
connect = require('connect');

// **Model class**: The atomic part of our Model. A model is basically a Javascript object, i.e. key-value pairs, with some helper functions to handle event triggering, persistence, etc.
var Model = Backnode.Model.extend();

// **View class**: Our main app view.
var View = Backnode.Router.extend({
  
  template: 'templates/index.html',
  
  // `render()`: It now uses the model tied to the view to render the response (and through the template engine). Here, `this.template` is simply a string, the template file content.
  render: function() {
    var data = this.model.toJSON();
    this.res.end(this.template.replace(/\{\{(\w+)\}\}/g, function(whole, match) {
      return data[match] || '';
    }));
  }
});

// **Router class**: Our main app router.
var Router = Backnode.Router.extend({
  routes: {
    '': 'index'
  },
  
  // `initialize()`: This is where the Model and View are instantiated. Models are usually added as instance property and passed to the view.
  initialize: function() {
    this.model = new Model();
    this.view = new View({
      model: this.model
    });
  },

  // `index()`: Now that we have a model to work with, we can use it to fetch or save our datas. If fetch calls is meant to be used asyncrhonously, you'll have to wrap up the `this.view.render()` in the suscess callback of the fetch hash parameter.
  index: function() {
    this.model.fetch();
    this.view.render();
  }
});

connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(new Router))
  .use(connect.static(__dirname))
  .listen(8080);

console.log('Server started, up and running on port 8080');

