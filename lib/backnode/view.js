
var Backbone = require('backbone'),
  cfg = Backbone.View.prototype._configure,
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

  this.root = options.root;

  var name    = this.name     = options.id;
  var engines = this.engines  = options.engines;
  var ext     = this.ext      = extname(name);

  if(!ext) ext = this.ext = '.' + options.engine, name = name + ext;

  this.engine = engines[ext];
  this.path = this.lookup(name);
};

View.prototype._ensureElement = function _ensureElement() {};
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
  if(this.path) this.engine(this.path, data, cb);
  else cb(new Error('Unable to lookup template ' + this.name + ' in ' + this.root));
  return this;
}
