

var backnode = require('../'),
  assert = require('assert'),
  http = require('http'),
  superagent = require('superagent');

var app = backnode();

app.use(backnode.logger('dev'));

var TestRouter = backnode.Router.extend({
  routes: {
    '/basic'                  : 'basic',
    '/foo'                    : 'foo',
    'without-trailing-slash'  : 'without',
    'GET /verb'               : 'verb',
    'POST /verb'              : 'verb',
    '/param/:param'           : 'param'
  },

  // res is always last argument and is a facade towards connect api,
  // wrapping req, res and next to hook into middleware logic and
  // eventually end the response.
  //
  // Client-side, the res object is still a facade but with different
  // implementation. I guess it'll rely on mediator / pubsub to delegate
  // handling to proper views / model / collections.
  basic: function basic(res) {
    res.end('basic!');
  },

  foo: function foo(res) {
    res.end('foo!');
  },
  without: function without(res) {
    res.end('without!');
  },

  verb: function verb(res) {
    res.end('verb!');
  },

  param: function param(value, res) {
    res.end(value + '!');
  },

  post: function post(res) {
    res.end('post!');
  }
});


app.use('/prefix', new TestRouter);
app.use(new TestRouter);


var server = app.listen(3000, function() {

  get('/basic', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'basic!');
    done();
  });

  get('/foo', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'foo!');
    done();
  });

  get('/without-trailing-slash', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'without!');
    done();
  });

  get('/verb', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'verb!');
    done();
  });

  post('/verb', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'verb!');
    done();
  });

  get('/param/hola', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'hola!');
    done();
  });

  get('/param/yo', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'yo!');
    done();
  });


  // subpath mounted router
  get('/prefix/param/hola', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'hola!');
    done();
  });

  get('/prefix/param/yo', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, 'yo!');
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

function post(uri, cb) {
  counter++;
  return superagent.post('http://localhost:3000' + uri).end(cb);
}

