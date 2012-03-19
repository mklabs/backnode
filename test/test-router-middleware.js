

var backnode = require('../'),
  assert = require('assert'),
  http = require('http'),
  superagent = require('superagent');

var app = backnode();

app.use(backnode.logger('dev'));

var TestRouter = backnode.Router.extend({
  routes: {
    '/basic'                  : 'basic'
  },

  initialize: function initialize() {
    this.use(this.middlewhatev('foo', 'setup by middleware #1'));
    this.use(this.middlewhatev('bar', 'setup by middleware #2'));
    this.use(this.middlewhatev('baz', 'setup by middleware #3'));
  },

  middlewhatev: function middlewhatev(prop, msg) {
    return function (req, res, next) {
      req[prop] = msg;
      next();
    }
  },

  basic: function basic(res) {
    var req = res.req;
    assert.equal(req.foo, 'setup by middleware #1');
    assert.equal(req.bar, 'setup by middleware #2');
    assert.equal(req.baz, 'setup by middleware #3');

    res.end('basic!');
  },
});

app.use(new TestRouter);


var server = app.listen(3000, function() {

  get('/basic', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'basic!');
    done();
  });

});


var counter = 0;
function done() {
  if(!--counter) server.close();
}

function get(uri, cb) {
  counter++;
  return superagent.get('http://localhost:3000' + uri).end(cb);
}
