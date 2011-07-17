

var Backnode = require('../../lib/backnode'),
Backbone = Backnode.Backbone,
_ = require('underscore'),
connect = require('connect');

var Model = Backnode.Model.extend({
  url: '/foobar'
});

var Router = Backnode.Router.extend({
  name: 'TodoRouter',
  routes: {
    '': 'index',
    'a/bunch/of/routes': 'bunch',
    'incoming/:id': 'incoming',
    'with/:param/:too':  'params',
    'POST verbs/are/supported/too': 'post',
    'ALL and/all/is/all': 'all'
  },
  
  initialize: function init() {
    console.log('Init Router', arguments);
    this.model = new Model();
  },
  
  index: function index() {
    this.res.end('Hello Backbone');
  },
  
  incoming: function incoming(id) {
    this.model.set({id: id});
    var res = this.res;
    this.model.fetch({
      success: function(data) {
        console.log('success', this, arguments);
        res.end('Incoming -- ' + JSON.stringify(this.toJSON()));
      }.bind(this.model)
    });
  },
  
  params: function params(param, too) {
    this.res.end('Hello ' +  param + ' and ' + too);
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
  