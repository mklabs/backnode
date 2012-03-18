

var backnode = require('../'),
  assert = require('assert'),
  http = require('http'),
  request = require('superagent');

var app = backnode()
  .use(backnode.favicon())
  .use(backnode.logger('dev'))
  .use(backnode.static('public'))
  .use(backnode.directory('public'))
  .use(backnode.cookieParser('my secret here'))
  .use(backnode.session())
  .use(function(req, res){
    res.end('Hello from Backnode!\n');
  });

var counter = 0;
var server = app.listen(3000, function() {
  counter++;
  request
    .get('http://localhost:3000')
    .end(function(res) {
      assert.equal(res.status, 200);
      assert.equal(res.text, 'Hello from Backnode!\n');
      done();
    });
});

function done() {
  if(!--counter) server.close();
}
