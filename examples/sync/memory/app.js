

var Backnode = require('../../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect');

var Model = Backnode.Model.extend();

var Router = Backnode.Router.extend({
  name: 'TodoRouter',
  routes: {
    '': 'index'
  },
  
  initialize: function init() {
    console.log('Init Router', arguments);
    this.model = new Model();
  },
  
  index: function index() {
    this.res.end('Hello Backbone');
  }
});

Backbone.sync = function(method, model, options) {
  console.log('Syncing with ', arguments);
  return options.success({foobar: 'yay'});
};


connect.createServer()
  .use(connect.logger(':method :url'))
  .use(Backnode(new Router))
  .use(connect.static(__dirname))
  .use(function(){ throw new Backnode.UrlError(); })
  .use(connect.errorHandler({ stack: true }))
  .listen(8080);
  
console.log('Yay started on lolcathost:8080');
