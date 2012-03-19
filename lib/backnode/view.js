
var Backbone = require('backbone'),
  cfg = Backbone.View.prototype._configure,
  engines = require('./engines'),
  Stream = require('stream').Stream,
  path = require('path'),
  dirname = path.dirname,
  basename = path.basename,
  extname = path.extname,
  exists = path.existsSync,
  join = path.join;

var View = module.exports = Backbone.View;

// view prototype. Meant to override specific part of
// Backbone.View.prototype

View.prototype._configure = function _configure(options) {
  cfg.apply(this, arguments);

  this.root     = options.root || path.resolve('views');
  this.engines  = options.engines || {
    '.html': engines.hogan
  };

  var name  = this.name = options.id;
  var ext   = this.ext  = extname(name);
  if(!ext) ext = this.ext = '.' + options.engine, name = name + ext;

  this.engine = this.engines[ext];
  this.path = this.lookup(name);
};

View.prototype._ensureElement = function _ensureElement() {
  this.el = new Buffer('');
};
View.prototype.delegateEvents = function delegateEvents() {};

// **lookup** return the path for the given `view`
View.prototype.lookup = function lookup(view) {
  var ext = this.ext,
    path = join(this.root, view);

  // <path>.<engine>
  if (exists(path)) return path;

  // <path>/index.<engine>
  path = join(dirname(path), basename(path, ext), 'index' + ext);
  if (exists(path)) return path;
};

View.prototype.render = function render(data, cb) {
  this.path = this.path || this.lookup(this.name);

  var self = this,
    m = this.model ? this.model.toJSON() : {};

  data = data || m;
  if(typeof data === 'function') cb = data, data = m;

  var wrap = function(e, str) {
    if(e) {
      cb && cb(e);
      return self.trigger('error', e);
    }
    self.el = new Buffer(str);
    cb && cb(null, str);
    self.trigger('render', str);
  };

  if(this.path) this.engine(this.path, data, wrap);
  else cb(new Error('Unable to lookup template ' + this.name + ' in ' + this.root));
  return this;
};

View.prototype.pipe = function pipe(destination) {
  var view = this.render(),
    stream = new Stream;

  destination = Array.isArray(destination) ? destination : [destination];
  destination.forEach(function(dst) {
    stream.pipe(dst);
  });

  this.on('render', function(str) {
    stream.emit('data', view.el);
    stream.emit('close');
  });
};
