

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
    '/view'                   : 'view',
    '/model'                  : 'model'
  },

  basic: function basic(res) {
    res.render('index', this.data());
  },

  view: function view(res) {
    var view = new backnode.View({
      id: 'index.html',
      engines: app.engines,
      root: app.get('views')
    });

    view.render(this.data(), function(e, str) {
      if(e) return res.next(e);
      res.end(str);
    });
  },

  model: function model(res) {
    var view = new backnode.View({
      id: 'index.html',
      model: new backnode.Model(this.data()),
      root: app.get('views')
    });

    view.render(function(e, str) {
      if(e) return res.next(e);
      res.end(str);
    });
  },

  data: function data(o) {
    return _.extend({}, {
      libs: Object.keys(pkg.dependencies).sort(),
      pkg: pkg
    }, o);
  }
});

app.use(new TestRouter);

var server = app.listen(3000, function() {

  get('/basic', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, fixture('response.html'));
    done();
  });

  get('/view', function(res) {
    assert.equal(res.status, 200);
    assert.equal(res.text, fixture('response.html'));
    done();
  });

  get('/model', function(res) {
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

