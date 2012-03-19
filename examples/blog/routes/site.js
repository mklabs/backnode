
var Post = require('../models/post'),
  backnode = require('../../../')

module.exports = backnode.Router.extend({
  routes: {
    '/': 'all'
  },

  all: function all(res) {
    Post.count(function(err, count) {
      Post.all(function(err, posts) {
        res.render('index', {
          count: count,
          posts: posts
        });
      });
    });
  }
});
