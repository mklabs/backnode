
// ## CouchDB adapter

// using cradle. This is a work in progress. For now,
// just focus on model creation and collection read.

// todo:
//  * read support for collection/modles
//  * update merge
//  * model create
//  * deletion support

var Backnode = require('../../../lib/backnode'),
_ = Backnode._,
cradle = require('cradle'),
tmpl = function tmpl(str,data){return str.replace(/:([a-z]+)/g, function(whole,match){return data[match];});};

var Store = module.exports = function Store(options){
  options = _.extend({}, options, {host: 'localhost', db: 'backnode'});
  this.db = new(cradle.Connection)().database(options.db);
};

_.extend(Store.prototype, {
  read: function(model, callback) {
    console.log('Read: ', model);
    
    // deal with model/collection case
    if(model instanceof Backnode.Model) {
      // get from db if we're dealing with a model
      return this.db.get(model.id, function(err, doc) {
        if(err) callback(err);
        callback(null, doc.toJSON());
      });
    }
    
    // get all otherwise
    this.db.all(function(err, doc) {
      if(err) callback(err);
      callback(null, doc.toJSON());
    });
    
    return this;
  },
  
  update: function(model, callback) {
    console.log('Update: ', model.id);
    
    this.db.merge(model.id, model.toJSON(), function(err, res) {
      if(err) callback(err);
      callback(null, res);
    });
    
    return this;
  },
  
  create: function(model, callback) {
    console.log('Create: ', model.id);
    
    this.db.save(model.id, model.toJSON(), function(err, res) {
      if(err) callback(err);
      callback(null, res);
    });
    
    return this;
  },
  delete: function(model) {}
});