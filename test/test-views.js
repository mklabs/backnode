

var fs = require('fs'),
  path = require('path'),
  backnode = require('../'),
  assert = require('assert'),
  http = require('http'),
  request = require('superagent');

var app = backnode();

app.use(backnode.logger('dev'));

app.set('views', __dirname + '/fixtures');


var pkg = require(path.join(__dirname, '../package'));
var TestRouter = backnode.Router.extend({
  routes: {
    '/basic'                  : 'basic',
    '/foo'                    : 'foo',
    'without-trailing-slash'  : 'without',
    'GET /verb'               : 'verb',
    'POST /verb'              : 'verb',
    '/param/:param'           : 'param'
  },

  basic: function basic(res) {
    res.render('index', {
      libs: Object.keys(pkg.dependencies).sort(),
      pkg: pkg
    });
  }
});

app.use(new TestRouter);

var server = app.listen(3000, function() {

  get('/basic', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, fixture('response.html'));
    done();
  });

});


var counter = 0;
function done() {
  if(!--counter) server.close();
}

function get(uri, cb) {
  counter++;
  return request.get('http://localhost:3000' + uri).end(cb);
}

function post(uri, cb) {
  counter++;
  return request.post('http://localhost:3000' + uri).end(cb);
}

function fixture(filepath) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filepath), 'utf8');
}

