

var fs = require('fs'),
  path = require('path'),
  http = require('http'),
  backnode = require('../'),
  assert = require('assert'),
  superagent = require('superagent');

var app = backnode();

app.use(backnode.logger('dev'));

var TestRouter = backnode.Router.extend({
  routes: {
    '/json': 'json'
  },

  json: function post(res) {
    res.json(this.data());
  },

  data: function data(o) {
    var pkg = this.pkg = this.pkg || require(path.join(__dirname, '../package'));
    return _.extend({}, {
      libs: Object.keys(pkg.dependencies).sort(),
      pkg: pkg
    }, o);
  }
});


var router = new TestRouter;
app.use(router);


var server = app.listen(3000, function() {

  get('/json', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
    assert.equal(res.type, 'application/json');
    assert.equal(res.text, JSON.stringify(router.data(), null, 2));
    assert.deepEqual(res.body, router.data());
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

function fixture(filepath) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filepath), 'utf8');
}
