
var backnode = require('../../../');

// Fake data store

var ids = 0,
  db = {};

var Post = module.exports = backnode.Model.extend({
  defaults: {
    title: 'Default title'
  },

  initialize: function() {
    this.id = ++ids;
    this.set('createdAt', new Date);
  },

  // will ideally do this by overriding Backbone.sync or this model's
  // sync
  save: function(cb) {
    db[this.id] = this;
    cb();
  },

  update: function(data, fn) {
    this.set('updatedAt', new Date);
    this.set(data);
    this.save(fn);
  },

  validate: function(attrs) {
    var cb, err;
    if(typeof attrs === 'function') cb = attrs, attrs = this.toJSON();
    if (!attrs.title) err = new Error('title required');
    else if (!attrs.body) err = new Error('body required');
    else if (attrs.body.length < 10) err = new Error(
      'body should be at least **10** characters long, was only ' + attrs.body.length
    );

    cb && cb(err);
    return err;
  },

  toJSON: function toJSON() {
    var o = backnode.Model.prototype.toJSON.call(this);
    o.id = this.id;
    return o;
  }

});

Post.count = function(fn){
  fn(null, Object.keys(db).length);
};

Post.all = function(fn){
  var arr = Object.keys(db).reduce(function(arr, id) {
    arr.push(db[id].toJSON());
    return arr;
  }, []);
  fn(null, arr);
};

Post.get = function(id, fn){
  fn(null, db[id]);
};

Post.destroy = function(id, fn) {
  if (db[id]) {
    delete db[id];
    fn();
  } else {
    fn(new Error('post ' + id + ' does not exist'));
  }
};

