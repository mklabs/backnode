
var backnode = require('../../'),
  app = module.exports = backnode();

// config

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('.jade', backnode.engines.jade);

// middleware

app.configure('development',function(){
  app.use(backnode.logger('dev'));
});

// Routers

var Site = require('./routes/site');


app.configure(function(){
  app.use(backnode.bodyParser());
  app.use(backnode.methodOverride());
  app.use(backnode.cookieParser('keyboard cat'));
  app.use(backnode.session());
  app.use(new Site);
  // app.use(new Post);

  app.use(backnode.static(__dirname + '/public'));
  app.use(backnode.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.listen(3000);
console.log('Backnode started on port 3000');
