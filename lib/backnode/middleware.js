
var middleware = module.exports;

//
// Init middleware borrowed and derived from express, exposing the app,
// request and next to response, wrapping the res prototype with
// extended one, as well as defaulting the X-Powered-By header field.
//
middleware.init = function init(app){
  return function(req, res, next){
    res.setHeader('X-Powered-By', 'Backnode');
    res.app = app;
    res.req = req;
    res.next = next;
    res.__proto__ = app.response;
    next();
  }
};

