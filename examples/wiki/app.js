  
// ## Backnode example

// This is a quick implementation of a basic example of what a backnode app could look like

// ##### Needs to figure out - 
// how do we hook up in the request/response lifecycle time? 
// in connect, express apps, actions gets request, response, next as funcion parameters
// and would break Backbone API. May we put according object req/res/next (and taking care of updating
// references for each request, will be overkill, performance-costly? may use EventEmitter for that
// at the middleware level.)

// we basically needs a way to acces them, one way or another. needs acess to request, response object, 
// namely for being able to end the response. needs access to next() method as well, important to pass request
// to following middleware if the response is not ended.

// if the setup of req/res/next is done using class attributes, do we need to put them in Router(at least), Views
// and Models? Models pretty sure that we shouldn't.

// ##### Error handling
// cannot just throw. Use of this.next(err);


var Backnode = require('../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Mustache = require('mustache'),
fs = require('fs'),
md = require('github-flavored-markdown').parse,
Path = require('path');

var Page, Router, PageView;

// ### Backbone.Router

Router = Backnode.Router.extend({
  routes: {
    '':                     'about',  // /about
    'about':                'about',  // /about
    'wiki':                 'about',  // /about
    'wiki/:page':           'post',   // /blog/blog-post
    'wiki/tag/:tag':        'tag',    // /blog/tag/node
    'search/:page/p:query': 'search'  // /search/one-page/p7
  },
  
  initialize: function() {
    // constructor/initialize new Router([options])
    
    // model may be Collections as well
    this.pages = new Pages();
    this.view = new PageView({model: this.pages});
    
  },
  
  // action, do something, usually generates response and res.end  
  about: function() {
    this.view.render();
    // actions can also pass control over next middleware
    // `this.next()`
  },
  
  search: function(page, query) {
    this.view.render();
  },
  
  post: function(post) {
    this.view.render(this.pages.getFile(post));
  }
});

// ### Page - Backbone.Model

// will have to override sync, when fetching/saving we no longer
// issues REST request to talk to the server, we already are the server

// Instead, could think of various adapters to handle persistence (mongo
// redis, couch, in memory, filesystem, ...)

Page = Backnode.Model.extend({
  toJSON: function() {
    var page = Backnode.Model.prototype.toJSON.apply(this, arguments),
    
    progressivePath = [],
      
    pathSegments = page.path.replace(/\/$/, '').split('/');
      
    pathSegments = _.map(pathSegments.slice(0, -1), function(seg) {
       progressivePath.push(seg);
       var url = "/" + progressivePath.join('/') + '/';
       return '<a href="' + url + '"> ' + seg + '</a>';
    }).concat(pathSegments.slice(-1));
    
    page.content = md(page.content);
    page.segments = pathSegments.join(' / ');
    return page;
  }
});


Pages = Backnode.Collection.extend({
  model: Page,
  
  // when created (at server startup), get the list of all pages from the file system
  // and init the collection. Only called once, and on server startup, go sync
  initialize: function() {
    this.fetch();
  },
  
  toJSON: function() {
    var json = Backnode.Collection.prototype.toJSON.apply(this, arguments);    
    return {
      title: 'Backbone on top of Connect for delicious applications',
      pages: json
    };
  },
  
  getFile: function(file) {
    return this.filter(function(page) {
      return page.get('file') === file;
    })[0];
  },
  
  comparator: function(page) {
    return page.get('file');
  }
});

// ### PageView - Backbone.View

// Get started with views by creating a custom view class. You'll want to override the render function, 
// specify your template string.

PageView = Backnode.View.extend({

  // Cache the template function for a single page.
  template: function(data) {
    return Mustache.to_html(this.templateStr, data); 
  },
  
  initialize: function(options) {
    // usually a filesystem call to get template string content.
    // If Views are initialized at server startup time, sync calls are fine
        
    // otherwise, could be wise to scans the entire package at startup, compile views and keeps
    // reference to either compiled function or template string for later use
    this.templateStr = fs.readFileSync('page.html').toString();
  },

  render: function(model) {
    model = model || this.model;
    model = model instanceof Backnode.Model ? new Pages(model) : model;
    this.res.end(this.template(model.toJSON()));
  }
});


// Override `Backbone.sync` to delegate to the filesystem.
// TODO: cleanup and delegates each method>case in functions/method
Backbone.sync = function(method, model, options, error) {
  console.log(arguments);
  
  if(method === "read") {
    if(model.file) {
      fs.readFile(Path.join(__dirname, 'backbone-wiki', model.file), function(err, content) {
        if(err) options.error(err);
        
        options.success({
          content: content 
        });
      });
    } else {
      fs.readdir(Path.join(__dirname, 'backbone-wiki'), function(err, files) {
        console.log(arguments);
        if (err) throw err;
        var ext = /\.md$|\.mkd$|\.markdown$/,
        ret = [], ln;
        
        files = files.filter(function(file) {
          return ext.test(file);
        });
        
        ln = files.length;
        
        _.each(files, function(file) {
          name = file.replace(ext, '');

          fs.readFile(Path.join(__dirname, 'backbone-wiki', file), function(err, content) {
            if(err) throw err;
            
            ret.push({
              title: name,
              file: file,
              path: './wiki/' + file,
              content: content.toString()
            });
            
            if((ln--) === 1) {
              options.success(ret);
            }
          });
        });
      });
    }
  } else if(method === "create") {
    
  } else if(method === "update") {
    
  } else if(method === "delete") {
    
  }
};



// a basic connect stack with a backnode middleware
// it is the server version of a $(function() { new Router(); Backbone.history.start(); })
connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(Router))
  .use(connect.directory(__dirname))
  .use(connect.static(__dirname))
  .listen(4000);

console.log('Server started, up and running on port 4000');
