
var Backnode = require('../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Mustache = require('mustache'),
fs = require('fs'),
md = require('github-flavored-markdown').parse,
Path = require('path');

// Router - handle incoming request
var Router = Backnode.Router.extend({
  name: 'Router',
  routes: {
    '':                     'about',    
    'about':                'about',    
    'wiki':                 'about',    
    'wiki/:page':           'post',     
    'wiki/tag/:tag':        'tag',      
    'search/:page/p:query': 'search'    
  },
  
  // Route constructor - get called on server startup and pass to the 
  // Backnode connect middleware. Creates and attach model
  // Collection and View as well.
  initialize: function() {
    this.pages = new Pages();
    this.view = new PageView({model: this.pages});
  },
  
  about: function about() {
    this.view.render();
  },
  
  search: function search(page, query) {
    this.view.render();
  },
  
  post: function post(post) {
    this.view.render(this.pages.getFile(post));
  }
});


// Page - Main model
//    {content: String, segments: String}
var Page = Backnode.Model.extend({
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


// Pages - Collection of Page models
var Pages = Backnode.Collection.extend({
  model: Page,
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


var PageView = Backnode.View.extend({
  template: Path.join(__dirname, 'page.html'),

  render: function(model) {
    model = model || this.model;
    model = model instanceof Backnode.Model ? new Pages(model) : model;
    
    this.res.end(Mustache.to_html(this.template, model.toJSON()));
  }
});

// todo - re-write to use some Store or somethin to split things in methods.
Backbone.sync = function(method, model, options, error) {
  console.log('Syncing with method: ', method);
  console.log('Model is ', model);
  
  if(method === "read") {
    return fs.readdir(Path.join(__dirname, 'backbone-wiki'), function(err, files) {
      if (err) throw err;
      var ext = /\.md$|\.mkd$|\.markdown$/,
      ret = [], ln;
      
      files = files.filter(function(file) {
        return ext.test(file);
      });
      
      ln = files.length;
      
      _.each(files, function(file) {
        var name = file.replace(ext, '');
        
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
  } else if(method === "create") {
    // impl
  } else if(method === "update") {
    // impl
  } else if(method === "delete") {
    // impl
  }
};



  
  
connect.createServer()
  .use(connect.logger(':method :url :status :res[content-length] - :response-time ms'))
  .use(Backnode(new Router))
  .use(connect.directory(__dirname))
  .use(connect.static(__dirname))
  .use(function(req, res, next){return next(new Backnode.UrlError('Foobar'))})
  .use(Backnode.errorHandler({ stack: true }))
  .listen(4000);

console.log('Server started, up and running on port 4000');
