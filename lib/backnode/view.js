
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

//
// **_configure** Performs the initial configuration of a view with a set of options.
// Keys with special meaning (`model`, `collection`, `id`, `className`) are attached
// directly to the view by Backbone.
//
// Backnode on its own do this for a few special options that, if passed, will also
// be attached directly to the view: `root`, `name`, and `engines`.
//
// `ext` is setup and derived from `name`'s' extname, `path` refers to the template
// filepath, `engine` is the template engine implemenation, usually one of consolidate
// template engine.
View.prototype._configure = function _configure(options) {
  cfg.apply(this, arguments);

  var engine    = options.engine || '.html';
  this.root     = options.root || path.resolve('views');
  this.engines  = options.engines || {
    '.html': engines.hogan
  };

  var name  = this.name = options.name || options.id;
  var ext   = this.ext  = extname(name);
  if(!ext) ext = this.ext = '.' + engine, name = name + ext;

  this.engine = this.engines[ext];
  this.path = this.lookup(name);
};

// **_ensureElement** Override View.prototype's _ensureElement to not build
// a DOM element to render into, but a raw Buffer.  Not sure yet, but could probably
// set element `$el` to be a JSDOM instance (but will need to be careful on that,
// may be very slow, thus not worth it)
View.prototype._ensureElement = function _ensureElement() {
  this.el = new Buffer('');
};

// **delegateEvents** Override delegateEvents to be a server-side noop.
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

// **render** is the core function that your view should override, in order to populate
// its element (`this.el`), with the appropriate HTML. The conventions is for render to
// always return this.
//
// By default, render implementation uses
// [consolidate](https://github.com/visionmedia/consolidate.js#readme), with default
// registered engine for default view extension (`.html`)
//
// render may take a `data` object, a callback `cb`, both or none. If no data is
// provided, then `this.model` is used if it exists or en empty object if it's not.
//
// The optional callback may be used to handle the rendered template string. On completion,
// `view.el` is always updated to be a Buffer with the appropriate HTML, and a `render` event will
// be raise with the String HTML.
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

  if(!this.engine) cb(new Error('No engine registered for ' + this.ext));
  else if(!this.path) cb(new Error('Unable to lookup template ' + this.name + ' in ' + this.root));
  else this.engine(this.path, data, wrap);

  return this;
};

// **pipe** is the stream.pipe equivalent of views. Creates and connect a read stream
// to `destination`. Incoming data on this stream gets written once and maps the
// rendered appropriate HTML.
//
// Returns the destination stream for unix-like usage: `view.pipe(B).pipe(C)`
View.prototype.pipe = function pipe(destination) {
  var view = this.render(),
    stream = new Stream;

  stream.pipe(destination);
  this.on('render', function(str) {
    stream.emit('data', view.el);
    destination.emit('data', view.el);
    stream.emit('end');
    destination.emit('end');
  });

  return destination;
};
