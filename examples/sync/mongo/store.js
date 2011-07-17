
var Backnode = require('../../../lib/backnode'),
_ = Backnode._,
mongoose = require('mongoose'),
Schema = mongoose.Schema,
tmpl = function tmpl(str,data){return str.replace(/:([a-z]+)/g, function(whole,match){return data[match];});};

// mongodb store, using mongoose

// 1. create a schema
// 2. create a model from this schema `mongoose.model('collectionName', schema)` -> collectionName is lowerCased in DB.
// 3. init a model instance and use it.


// basically, from a backbone model
// 1. use toJSON() (internally _.clone(this.attributes))
// 2. from the attributes object, iterate through each property and determine js native
// 3. create corresponding Schema
// 4. create, cache and get the corresponding mongoose model (new db.model('collection', new Schema({prop: String})))
// 5. use it

var Store = module.exports = function Store(options){
  options = _.extend({}, options, {host: 'localhost', db: 'backnode'});
  var db = this.db = mongoose.createConnection(tmpl('mongodb://:host/:db', options));
};

var item = {};  

_.extend(Store.prototype, {
  read: cache(function(m, collection, model, callback) {
    console.log('Read: ', model);
    
    collection.find({}, function(err, data) {
      if(err) throw err;
      return callback(null, data);
    });
    
    return this;
  }),
  
  update: cache(function(m, collection, model, callback) {
    console.log('Update: ', model);
    
    model.save(function(err) {
      if(err) throw err;
      return callback(null, m);
    });
    
    return this;
  }),
  
  create: cache(function(m, collection, model, callback) {
    console.log('Create: ', model);
    
    model.save(function(err) {
      if(err) throw err;
      return callback(null, m);
    });
    
    return this;
  }),
  delete: cache(function(model) {})
});

// this wrapping function handle the internal cache of Schemas, mongoose Model and singleton instances.
// The cache system is driven by Backbones' model.cid. It alter the store signature by appending the 
// according mongoose instance, bind to the `this.db` connection.
function cache(fn) {
  var schemas = {},
  models = {},
  instances = {};
  return function(model, callback) {
    if(instances[model.cid]) return fn.call(this, model, models[model.cid], instances[model.cid], callback); 
    
    // build schema from model.attributes
    var collection = _.isFunction(model.url) ? model.url() : model.url,
    isCol = model instanceof Backnode.Collection,
    // schema less on collection.
    att = isCol ? {} : model.toJSON(),
    schema = {},
    db = this.db;
    
    _.each(att, function(val, key) {
      schema[key] = val.constructor;
    });
    
    schemas[model.cid] = new Schema(schema);
    models[model.cid] = db.model(collection, schemas[model.cid]);
    instances[model.cid] = new models[model.cid](att);
    
    return fn.call(this, model, models[model.cid], instances[model.cid], callback);
  };
}