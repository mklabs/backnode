# Backnode

**Experiment on making Backbone usable in Node**. 

Express inspired web development framework, built on
[Backbone](http://documentcloud.github.com/backbone/) and
[Connect](http://github.com/senchalabs/connect).

## Synopsis

    var app = backnode();

    var Router = backnode.Router.extend({
      routes: {
        '/basic'                  : 'basic',
        '/json'                   : 'json',
        'GET /verb'               : 'verb',
        'POST /verb'              : 'post',
        '/param/:param'           : 'param',
        '/pipe'                   : 'pipe'
      },

      // res is always last argument and is the response object,
      // wrapping req and next to hook into middleware logic and
      // eventually end the response.
      basic: function basic(res) {
        res.end('basic!');
      },

      json: function foo(res) {
        res.json({ message: '' });
      },

      verb: function verb(res) {
        res.end('verb!');
      },

      post: function post(res) {
        res.end('post!');
      },

      param: function param(value, res) {
        res.end(value + '!');
      },

      render: function render(res) {
        res.render('index', { foo: 'bar' });
      },

      view: function view(res) {
        new backnode.View({ id: 'index.html' }).render(function(e, str) {
          if(e) return res.next();
          res.end(str);
        });
      },

      pipe: function pipe(res) {
        new backnode.View({ id: 'index.html' }).pipe(res);
      },

      model: function model() {
        var model = new backnode.Model({ name: 'backnode' });
        new backnode.View({ id: 'index.html', model: model }).pipe(res);
      }
    });

    var app = backnode()
      .use(backnode.favicon())
      .use(backnode.logger('dev'))
      .use(backnode.static('public'))
      .use(backnode.directory('public'))
      .use(backnode.cookieParser('my secret here'))
      .use(backnode.session())
      .use(new Router)
      .use('/subpath', new Router)

    app.listen(3000);

## Installation

    $ npm install backnode

## Tests

[![Build Status](https://secure.travis-ci.org/mklabs/backnode.png?branch=master)](http://travis-ci.org/mklabs/backnode)

    $ npm test

It'll run every assertion `test/test-*.js` files.

