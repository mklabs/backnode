
var Backnode = require('../../../lib/backnode'),
_ = Backnode._,
cradle = require('cradle'),
tmpl = function tmpl(str,data){return str.replace(/:([a-z]+)/g, function(whole,match){return data[match];});};

var Store = module.exports = function Store(options){
  options = _.extend({}, options, {host: 'localhost', db: 'backnode'});
  this.db = new(cradle.Connection)().database(options.db);
};

var item = {};  

_.extend(Store.prototype, {
  read: function(model, callback) {
    console.log('Read: ', model);
    
    if(model.get('craddle')) {
      return this.db.get(model.get('craddle'), function(err, res) {
        if(err) callback(err);
        callback(null, res);
      });
    }
    
    this.db.all(function(err, doc) {
      if(err) callback(err);
      callback(null, doc.toJSON());
    });
    
    return this;
  },
  
  update: function(model, callback) {
    console.log('Update: ', model);
    
//    this.db.merge(model.cid, model.toJSON(), function(err, res) {
    this.db.save(model.get('craddle'), model.toJSON(), function(err, res) {
      if(err) callback(err);
      callback(null, res);
    });
    
    return this;
  },
  
  create: function(model, callback) {
    console.log('Create: ', model);
    
    this.db.save(model.get('craddle'), model.toJSON(), function(err, res) {
      if(err) callback(err);
      callback(null, res);
    });
    
    return this;
  },
  delete: function(model) {}
});