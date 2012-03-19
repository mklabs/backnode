

// Basic setup demonstrating the ure of
// consolidate](https://github.com/visionmedia/consolidate.js) and
// hogan template engine
//


var backnode = require('../../'),
  path = require('path');

var app = module.exports = backnode();

//
// Register hogan as `.html`. The following view setup is actually the default
// configuration, and thus can be omitted:
//
// - setup hogan engine as template engine for `.html` extension
// - setup views directory for templates lookup
// - setup default view engine to be `html`
//

app.engine('.html', backnode.engines.hogan);

//
// Optional since backnode (just like express) defaults to `$cwd/views`
app.set('views', path.join(__dirname, 'views'));

//
// Without this you would need to
// supply the extension to res.render()
//
// ex: res.render('users.html').
//
app.set('view engine', 'html');

// Dummy data
var libs = [
  { name: 'backbone', description: 'Give your JS App some Backbone with Models, Views, Collections, and Events.' },
  { name: 'underscore', description: "JavaScript's functional programming helper library." },
  { name: 'connect', description: 'High performance middleware framework' }
];

var Router = backnode.Router.extend({
  routes: {
    '/': 'index'
  },

  index: function index(res) {
    res.render('libs', { libs: libs });
  }
});

app.use(new Router);

app.listen(3000);
console.log('Backnode app started on port', app.get('port'));
