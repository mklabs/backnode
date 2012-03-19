

var backnode = require('../../')
  http = require('http'),
  url = require('url'),
  join = require('path').join;

var app = module.exports = backnode();

var env = process.env;
var proxy = env.http_proxy || env.https_proxy || env.HTTP_PROXY || env.HTTPS_PROXY;

// Expose our views

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('.jade', backnode.engines.jade);


// Request github json api with `path` and optional `options`.
function request(path, options, fn){
  options = options || {};

  var endpoint = 'github.com',
    p = proxy ? url.parse(proxy) : {};

  if(p.hostname) options.host = p.hostname || options.host;
  if(p.port) options.port = p.port || options.port;

  options.path = p.protocol ? p.protocol + '//' + join(endpoint, '/api/v2/json', path) : join('/api/v2/json', path);
  options.path = options.path.replace(/\\/g, '/');

  options.host = options.host || endpoint;

  var req = http.request(options);
  req.on('response', function(res){
    res.body = '';
    res.on('data', function(chunk){ res.body += chunk; });
    res.on('end', function(){
      try {
        fn(null, JSON.parse(res.body));
      } catch (err) {
        fn(err);
      }
    });
  });
  req.end();
}

// Sort repositories by watchers desc.
function sort(repos){
  return repos.sort(function(a, b){
    if (a.watchers == b.watchers) return 0;
    if (a.watchers > b.watchers) return -1;
    if (a.watchers < b.watchers) return 1;
  });
}

// Calculate total watchers.
function totalWatchers(repos) {
  return repos.reduce(function(sum, repo){
    return sum + repo.watchers;
  }, 0);
}

var Router = backnode.Router.extend({

  routes: {
    '/':              'index',
    '/repos/*path':   'user'
  },

  // Default to my user name ☺
  index: function index(res) {
    res.redirect('/repos/mklabs');
  },

  // display repos
  user: function user(names, res) {
    names = names.split('/');
    var users = [];
    (function fetchData(name){
      if(!name) return res.render('index', { users: users });
      // We have a user name
      console.log('... fetching \x1b[33m%s\x1b[0m', name);
      request('/repos/show/' + name, {}, function(err, user) {
        if(err) return res.next(err);
        user.totalWatchers = totalWatchers(user.repositories);
        user.repos = sort(user.repositories);
        user.name = name;
        users.push(user);
        fetchData(names.shift());
      });
    })(names.shift());
  }
});

app.use(new Router);

// Serve statics from ./public
app.use(backnode.static(__dirname + '/public'));

// Listen on port 3000
app.listen(3000);
console.log('Backbone app started on port', app.get('port'));
