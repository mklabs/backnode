
var Backnode = require('../../../lib/backnode'),
_ = require('underscore');

// in memory store

var Store = module.exports = function Store(){
  // simple key value pair
  this.store = {};
};

_.extend(Store.prototype, {
  read: function(model, callback) {
    var item = this.store[model.id];
    // if(!item) return callback('No item for id: ' + model.id);
    
    // return all for now
    callback(null, this.store);
    return this;
  },
  create: function(model, callback) {
    if(!model.id) return callback('No id: ' + JSON.stringify(model.toJSON()));
    var item = this.store[model.id] = model.toJSON();
    callback(null, item);
    return this;
  },
  update: function(model, callback) {
    if(!model.id) return callback('No id: ' + JSON.stringify(model.toJSON()));
    var item = this.store[model.id] = model.toJSON();
    callback(null, item);
    return this;
  },
  delete: function(model) {
    if(!model.id) return callback('No id: ' + JSON.stringify(model.toJSON()));
    delete this.store[model.id];
    callback(null);
    return this;
  }
});