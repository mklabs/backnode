

var consolidate = require('consolidate');

var engines = module.exports;

// setup each of consolidate template engine as lazy-loaded requires
Object.keys(consolidate).forEach(function(engine) {
  if(engine === 'clearCache' || engine === 'version') return;
  engines[engine] = consolidate[engine];
});
