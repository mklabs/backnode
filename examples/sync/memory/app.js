

var Backnode = require('../../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect'),
Store = require('./store');

var Model = Backnode.Model.extend({
  defaults: {
    description: 'Testing in memory store'
  }
});

var Collection = Backnode.Collection.extend({
  url: 'memoryStore',
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
  },
  
  read: function read(id) {
    var cb = function(data){this.res.end('-----> ' + JSON.stringify(data));}.bind(this);
    
    this.collection
      .fetch({
        success: cb,
        error: cb
      });
  },
  
  create: function create(id) {
    var self = this;
    
    this.collection.create({id: id},  {
      success: function(data) {
        self.res.end('Created/Updated ' + id + ' with ' + JSON.stringify(data));
      }
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
  
console.log('Yay started on lolcathost:8080');
