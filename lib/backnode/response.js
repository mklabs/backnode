

var fs = require('fs'),
  http = require('http'),
  connect = require('connect'),
  parse = require('url').parse,
  join = require('path').join;

// Response prototype.
var res = module.exports = {
  __proto__: http.ServerResponse.prototype
};

// **render** map the express res.render api. Render a `view` with the
// given `data` and optional callback. When a callback is given a
// reponse will not be made automatically, otherwise a response with
// statusCode 200 and `text/html` is given.
res.render = function(view, data, cb) {
  var self = this,
    app = this.app;

  data = data || {};

  // support callback function as second arg
  if(typeof data === 'function') cb = data, data = {};

  // default callback to respond
  cb = cb || function(err, str){
    if (err) return self.next(err);
    self.end(str);
  };

  // render
  app.render(view, data, cb);
};


// **json** send json response.
res.json = function json(data) {
  var spaces = this.app.get('json spaces') || 2,
    body = JSON.stringify(data, null, spaces);

  this.charset = this.charset || 'utf-8';
  this.setHeader('Content-Type', 'application/json');
  return this.end(body);
};

// **redirect** to the gien `url` with optional response `status`
res.redirect = function redirect(url) {
  var app = this.app,
    req = this.req,
    status = 302,
    route = app.route,
    path = parse(req.url).pathname,
    host = req.headers.host,
    protocol = req.connection.encrypted ? 'https' : 'http';

  // allow status / url
  if (arguments.length === 2) status = url, url = arguments[1];

  var rel = !~url.indexOf('://');
  // relative?
  if(rel) {
    // relative to path
    if(url.indexOf('./') === 0 || url.indexOf('..')) url = path + '/' + url;
    // relative to mount point
    else if(url[0] === '/') url = route + '/' + url;

    // normalize url path, replacing any `//` by a single `/` and
    // reverting back `\` sepearator to be unix-like on windows
    url = join(url).replace(/\\/g, '/');
    url = protocol + '://' + host + url;
  }


  var body = req.method === 'HEAD' ? null :
      '<p>Redirecting to <a href=":url">:url</a></p>'.replace(/:url/g, url);

  this.statusCode = status;
  this.setHeader('Content-Type', 'text/html');
  this.setHeader('Location', url);
  this.end(body);

};
