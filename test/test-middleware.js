

var backnode = require('../'),
  assert = require('assert'),
  http = require('http');

var app = backnode()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use(connect.directory('public'))
  .use(connect.cookieParser('my secret here'))
  .use(connect.session())
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

http.createServer(app).listen(3000);

