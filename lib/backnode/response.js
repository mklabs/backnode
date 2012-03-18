

var fs = require('fs'),
  http = require('http'),
  path = require('path'),
  connect = require('connect');

// Response prototype.
var res = module.exports = {
  __proto__: http.ServerResponse.prototype
};

// **render** map the express res.render api. Render a `view` with the
// given `data` and optional callback. When a callback is given a
// reponse will not be made automatically, otherwise a response with
// statusCode 200 and `text/html` is given.
res.render = function(view, data, cb) {
  debugger;
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
