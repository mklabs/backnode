

var Backnode = require('../../../lib/backnode'),
Backbone = Backnode.Backbone,
Path = require('path'),
_ = require('underscore'),
connect = require('connect'),
Store = require('./store'),

tmpl = function tmpl(str,data){return str.replace(/:([a-z]+)/g, function(whole,match){return data[match];});},

Layout, List, Item, Model, Collection, Router;

// todo: avoid this. needed to be able to fecth on initialize
Backnode(new (Backbone.Router.extend({routes:{}})), { store: new Store() });

Model = Backnode.Model.extend({
  defaults: {
    description: 'Testing couchdb store',
    craddle: 'using craddle'
  }
});

Collection = Backnode.Collection.extend({
  url: 'couchbone',
  model: Model,
  toJSON: function() {
    var m = Backnode.Collection.prototype.toJSON.apply(this, arguments);
    require('eyes').inspect(m);
    return m;
  }
});

Router = Backnode.Router.extend({
  name: 'TodoRouter',
  routes: {
    '' :              '',       
    'read/:id':       'read',
    'create/:id':     'create',
    'update/:id':     'update',
    'delete/:id':     'delete'
  },
  
  initialize: function init() {
    console.log('Init Router', arguments);
    
    // create ant attach the collection
    this.collection = new Collection();
    
    
    // create and attach the list view, give the view some model too
    this.list = new List({
      collection: this.collection
    });
    
    // create and attach item view, models are attached in request handler
    this.item = new Item();
    
    // fetch collection from store on startup
    this.collection.fetch();
  },
  
  read: function read(id) {
    var m = this.collection.get(id);
    
    if(!id) {
      // no params, fetch from collection and return all
      return this.collection.fetch({ 
        success: _.bind(this.list.render, this.list),
        errror: _.bind(this.list.render, this.list)
      });
    }
    
    if(!m) {
      // unable to find any entry for provided id
      return this.next(id + ' does not exist');
    }
    
    // ok, fetch from model
    this.item.model = m;
    m.fetch({
      success: _.bind(this.item.render, this.item),
      error: _.bind(this.item.render, this.item)
    });
  },
  
  update: function(id) {
    var m = this.collection.get(id);
    
    if(!m) {
      // unable to find any entry for provided id
      return this.next(id + ' does not exist');
    }
    
    this.item.model = m;
    m.set({
      description: 'Testing couchdb store' + Math.floor(Math.random()  * 1000)
    }).save({
      success: _.bind(this.item.render, this.item),
      error: _.bind(this.item.render, this.item)
    });
  },
  
  create: function create(id) {
    // first check if a model with this id is already created    
    if(this.collection.get(id)) {
      return this.next(id + ' is already created');
    }
    
    // ok, create model by creating it into the collection
    this.collection.create({identifier: id},  {
      success: _.bind(this.list.render, this.list),
      error: _.bind(this.list.render, this.list)
    });
  },
});

Layout = Backnode.View.extend({
  template: Path.join(__dirname, 'layout.html'),
  
  // layout render
  render: function render() {
    // can be used with subclass associated with either model or collection 
    var m = this.model || this.collection;
    this.res.end(tmpl(this.template, {
      title: 'Test couchdb',
      content: JSON.stringify(m.toJSON())
    }));
  }
});

// link to collection
List = Layout.extend({
  template: Path.join(__dirname, 'list.html')
});

// link to a single model
Item = Layout.extend({
  template: Path.join(__dirname, 'item.html')
});


connect.createServer()
  .use(connect.logger(':method :url'))
  .use(Backnode(new Router(), { store: new Store()}))
  .use(connect.static(__dirname))
  .use(function(){ throw new Backnode.UrlError(); })
  .use(connect.errorHandler({ stack: true }))
  .listen(8081);
  
console.log('Yay started on lolcathost:8081');
