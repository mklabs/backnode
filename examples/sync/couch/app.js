

var Backnode = require('../../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Store = require('./store'),

tmpl = function tmpl(str,data){return str.replace(/:([a-z]+)/g, function(whole,match){return data[match];});},

layout = '<!doctype html><html><head></head><body><h2>:title</h2><div class="content">:content</div></body></html>';

// todo: avoid this. needed to be able to fecth on initialize
Backnode(new (Backbone.Router.extend({routes:{}})), { store: new Store()});

var Model = Backnode.Model.extend({
  defaults: {
    description: 'Testing couchdb store',
    craddle: 'using craddle'
  }
});

var Collection = Backnode.Collection.extend({
  url: 'couchbone',
  model: Model
});

var Router = Backnode.Router.extend({
  name: 'TodoRouter',
  routes: {
    'read/:id':       'read',
    'create/:id':     'create',
    'update/:id':     'update',
    'delete/:id':     'delete'
  },
  
  initialize: function init() {
    console.log('Init Router', arguments);
    this.collection = new Collection();
    this.collection.fetch();
  },
  
  read: function read(id) {
    var cb = function(data){
      this.res.end(tmpl(layout, {
        title: 'Read --> ' + id, 
        content: JSON.stringify(data.toJSON())
      }));
    }.bind(this),
    m = this.collection.get(id);
    
    if(!id) {
      // no params, fetch from collection and return all
      return this.collection.fetch({ success: cb });
    }
    
    if(!m) {
      // unable to find any entry for provided id
      return this.next(id + ' does not exist');
    }
    
    // ok, fetch from model
    m = m || this.collection;
    m.fetch({
      success: cb,
      error: cb
    });
  },
  
  create: function create(id) {
    // first check if a model with this id was already created    
    if(this.collection.get(id)) {
      return this.next(id + ' is already created');
    }
    
    // ok, create model by creating it into the collection
    this.collection.create({id: id},  {
      success: function(data) {
        this.res.end(tmpl(layout, {
          title: 'Created --> ' + id, 
          content: JSON.stringify(data.toJSON())
        }));
      }.bind(this)
    });
  },
});


connect.createServer()
  .use(connect.logger(':method :url'))
  .use(Backnode(new Router(), { store: new Store()}))
  .use(connect.static(__dirname))
  .use(function(){ throw new Backnode.UrlError(); })
  .use(connect.errorHandler({ stack: true }))
  .listen(8081);
  
console.log('Yay started on lolcathost:8081');
