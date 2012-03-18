

var fs = require('fs'),
  path = require('path'),
  backnode = require('../'),
  assert = require('assert'),
  http = require('http'),
  request = require('superagent');

var app = backnode();


app.configure('development', function() {
  app.set('foobar', 'dev:foobar');
  app.set({
    foo: 'dev:foo',
    bar: 'dev:bar'
  });

  app.enable('dev:enabled');
});

assert.equal(app.env(), 'development');
assert.equal(app.get('foobar'), 'dev:foobar');
assert.equal(app.get('foo'), 'dev:foo');
assert.equal(app.get('bar'), 'dev:bar');
assert.equal(app.get('dev:enabled'), true);


app.currentEnv = 'production'
app.configure('production', function() {
  app.set('foobar', 'prod:foobar');
  app.set({
    foo: 'prod:foo',
    bar: 'prod:bar'
  });

  app.enable('prod:enabled');
});

assert.equal(app.env(), 'production');
assert.equal(app.get('foobar'), 'prod:foobar');
assert.equal(app.get('foo'), 'prod:foo');
assert.equal(app.get('bar'), 'prod:bar');
assert.equal(app.get('prod:enabled'), true);

