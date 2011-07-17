
var Backnode = require('../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Mustache = require('mustache'),
md = require('github-flavored-markdown').parse,
fs = require('fs'),
Path = require('path');

// ## Post - Main model
// Post holds the following informations:
// 
//      {
//        title: 'Some blog post',
//        href: '/path/to/blog/post',
//        filename: '/path/to/blog/post.md'
//        markdown: '## Some blog post\n\nOnce upon a time...',
//        content: '<h2>Some blog post</h2><p>Once upon a time...</p>'
//      }
//
var Post = Backnode.Model.extend({
  toJSON: function() {
    var page = Backnode.Model.prototype.toJSON.apply(this, arguments);
    page.content = md(page.markdown);
    return page;
  }
});

// ## Posts - Collection of Post models
var Posts = Backnode.Collection.extend({
  
  model: Post,
  
  initialize: function() {
    // bind to the error event
    this.bind('error', function(model, resp, options) {
      throw new Error(resp);
    });
    
    // fetch our collections.
    // Here, backbone.sync is overriden and use the filesystem
    // to get posts content and metadata
    this.fetch();

  },
  
  path: 'content',
  
  toJSON: function() {
    var json = Backnode.Collection.prototype.toJSON.apply(this, arguments);
    
    // Our views awaits something with title and an array of posts to iterate trough
    // so, serialize our collections and give them to views as {{posts}}
    return {
      title: 'Backbone on top of Connect for delicious applications',
      posts: json
    };
  },
  
  // special comparator function
  // backbone uses this internally to automatically sort our collections
  comparator: function(post) {
    return post.get('filename');
  }
});

// ## IndexView - Backbone view that drives the output of the index.html template
// may ends up with a special template property which value would be the relative path
// to the template file.

var Layout = Backnode.View.extend({
  template: Path.join(__dirname, 'theme/default/layout.html'),

   // ##### View constructor
   // is when the view instance gets its template file
   initialize: function(options) {
    console.log('init view layout:');
   },

   // ##### render method
   // the template file expects a collection to work properly
   // if model parameter is a Model instead, wraps it in a collection
   // to seamlessly use the same file for both index and post actions.
   render: function(model) {
     model = model || this.model;
     model = model instanceof Backnode.Model ? new Posts(model) : model;
     this.res.end(Mustache.to_html(this.template, model.toJSON()));
   }
});

var IndexView = Layout.extend({
  template: Path.join(__dirname, 'theme/default/index.html'),
  initialize: function initialize() {
    console.log('init view index:');
  }
});

var Wrapper = Layout.extend({
  template: Path.join(__dirname, 'theme/default/wrapper.html'),
  initialize: function initialize() {
    console.log('init view Wrapper:');
  }
});

var PostView = Wrapper.extend({
  template: Path.join(__dirname, 'theme/default/index.html'),
  initialize: function initialize() {
    console.log('init post view:');
  }
});

// ## Router - handle incoming request
var BlogRouter = Backnode.Router.extend({
  name: 'BlogRouter',
  routes: {
    '':                     'index',    
    'article/:article':     'article'
  },
  
  // ##### Route constructor
  // Creates and attach model Collections and Views.
  initialize: function() {
    this.posts = new Posts();
    
    // create a view tied to our posts collection
    this.indexView = new IndexView({model: this.posts});
    
    // create a view tied to our posts collection
    this.postView = new PostView({model: this.posts});
  },
  
  index: function index() {
    this.indexView.render();
  },
  
  article: function article(art) {
    this.postView.render(this.posts.get(art));
  }
});


// Helper function to get a path from a Model or Collection as a property
// or as a function.
var getPath = function(object) {
  if (!(object && object.path)) return null;
  return _.isFunction(object.path) ? object.path() : object.path;
};

// Throw an error when a path is needed, and none is supplied.
var pathError = function() {
  throw new Error('A "path" property or function must be specified');
};

// Backbone.sync
// -------------

// Override this function to change the manner in which Backbone persists
// models to the server. You will be passed the type of request, and the
// model in question. 
//
// Since we're already on the server part here, we might want to tweak this a little bit. 
// By default, backbone makes a RESTful Ajax request to the model's `url()`. Some
// possible customizations could be:
//
// * Use http request server-to-server to proxy the RESTful request to the model's `url()`
// and adopt a middle-end approach.
// * Hooks up the model on the filesystem, a readFile/writeFile could be used depending on
// the method name. 
// * Talks to a mongo, couch, redis backend and provide needed adapters.
//
Backbone.sync = function(method, model, options) {
//  console.log('Syncing with method: ', method);
//  console.log('Model is ', model);
//  console.log('options is ', options);
  
  var path;
  
  if(method !=="read") {
    console.log('method is not read. not implemented yet.');
    return options.error('method is not read. not implemented yet.');
  }
  
  // Ensure that we have a Path.
  if (!options.path) {
    options.path = getPath(model) || pathError();
  }
  
  path = Path.join(__dirname, options.path);
  return fs.readdir(path, function(err, files) {
    if (err) {
      return options.error(err + ': ' + path);
    }
    
    var ext = /\.md$|\.mkd$|\.markdown$/,
    ret = [], ln;
    
    files = files.filter(function(file) {
      return ext.test(file);
    });
    
    ln = files.length;
    
    _.each(files, function(file) {
      var name = file.replace(ext, '');
      
      fs.readFile(Path.join(path, file), function(err, content) {
        if(err) {
          return options.error(err.message);
        }
        
        ret.push({
          id: name,
          title: name,
          filename: file,
          href: '/article/' + name,
          markdown: content.toString()
        });
        
        if((ln--) === 1) {
          options.success(ret);
        }
      });
    });
  });
};

connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(new BlogRouter()))
  .use(connect.directory(__dirname))
  .use(connect.static(__dirname))
  .use(function(req, res, next){return next(new Backnode.UrlError('Foobar'));})
  .use(Backnode.errorHandler({ stack: true }))
  .listen(5678);
  
console.log('Server started, up and running on port 5678');


