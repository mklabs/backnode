

var backnode = require('../../../'),
  basicAuth = backnode.basicAuth,
  Post = require('../models/post');

module.exports = backnode.Router.extend({
  routes: {
    '/post/add'         : 'add',
    '/post/:post'       : 'display',
    '/post/:post/edit'  : 'edit',
    'POST post'         : 'save',
    'PUT /post/:post'   : 'update'
  },

  initialize: function initialize() {
    // setup the stack of middleware to run through for this router
    // before reaching action handler
    this.use(basicAuth(this.auth));
  },

  // apply basic auth to all post related routes
  auth: function auth(user, pass) {
    return user === 'admin' && pass === 'backnode';
  },

  display: function post(id, res) {
    Post.get(id, function(err, post) {
      if (err) return res.next(err);
      if (!post) return res.next(new Error('failed to load post ' + id));
      res.render('post', { post: post.toJSON() });
    });
  },

  add: function add(res) {
    var session = res.req.session,
      post = session.post || {};

    res.render('post/form', { post: post, update: false });
  },

  edit: function edit(id, res) {
    Post.get(id, function(err, post) {
      if (err) return res.next(err);
      if (!post) return res.next(new Error('failed to load post ' + id));
      res.render('post/form', { post: post.toJSON(), update: true });
    });
  },

  save: function save(res) {
    var req = res.req,
      data = req.body.post || {},
      post = new Post(data);

    post.validate(function(err) {
      console.log('validate', err);
      if (err) {
        req.session.error = err.message;
        req.session.post = post;
        return res.redirect('back');
      }

      post.save(function(err) {
        req.session.message = 'Successfully created the post.';
        res.redirect('/post/' + post.id);
      });
    });
  },

  update: function update(id, res) {
    var req = res.req;
    Post.get(id, function(err, post) {
      if (err) return res.next(err);
      if (!post) return res.next(new Error('failed to load post ' + id));
      post.validate(function(err) {
        if (err) {
          req.session.error = err.message;
          return res.redirect('back');
        }

        post.update(req.body.post, function(err){
          if (err) return res.next(err);
          req.session.message = 'Successfully updated post';
          res.redirect('back');
        });
      });
    });
  }
});

