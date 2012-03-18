#!/usr/bin/env node

//
// Test runner - coming and derived from tako's runner, itself contributed by @mmalecki
// -> https://raw.github.com/mikeal/tako/master/tests/run.js
//

//
// > I don't use test frameworks. I like my tests to require nothing but node.js, it
// > means they are understandable by anyone that is familiar with node and not my
// > chosen test framework.
//
// Mikeal in http://www.mikealrogers.com/posts/a-little-test-server.html
//
// I more and more tends to adopt the same approach. Being a huge fan of vows, using
// it in almost every test case I had to setup, sometimes it just feel good to
// use no test framework at all.


//
// ### Usage
//
// By default, `npm test` will run every assertion files in the `test/`
// repository that begins with `test-` (eg. `test/test-*`).
//
// The `--filter` configuration may be used to change the prefix filter (that
// defaults to `test-`) to run a specific set or a single test to run.
//
// Run all test, that begins with `test-`.
//
//    npm test
//
// Run a specific assertion test file
//
//    npm test --filter test-basics
//
// Run a different set of test
//
//    npm test --filter debug-
//

var fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn;

var testTimeout = 8000,
  verbose = false,
  failed = [],
  success = [],
  pathPrefix = __dirname;

var opts = npmConfig();
var filter = new RegExp('^' + (opts.filter || 'test-'));
runTests(fs.readdirSync(pathPrefix).filter(function (test) {
  return filter.test(test);
}));


//
// Test helpers
//
function runTest(test, callback) {
  var child = spawn(process.execPath, [ path.join(__dirname, test) ]),
    stdout = '',
    stderr = '',
    killTimeout;

  child.stdout.on('data', function (chunk) {
    stdout += chunk;
  });

  child.stderr.on('data', function (chunk) {
    stderr += chunk;
  });

  killTimeout = setTimeout(function () {
    child.kill();
    console.log('  ' + path.basename(test) + ' timed out');
    callback();
  }, testTimeout);

  child.on('exit', function (exitCode) {
    clearTimeout(killTimeout);

    console.log('  ' + (exitCode ? '✘' : '✔') + ' ' + path.basename(test));

    (exitCode ? failed : success).push(test);

    if (exitCode || verbose) {
      console.log('stdout:');
      process.stdout.write(stdout);

      console.log('stderr:');
      process.stdout.write(stderr);
    }

    callback();
  })
}

function runTests(tests) {
  var index = 0;

  console.log('Running tests:');

  if(!tests.length) return console.log('No test to run buddy');

  function next() {
    if (index === tests.length - 1) {
      console.log();
      console.log('Summary:');
      console.log('  ' + success.length + '\tpassed tests');
      console.log('  ' + failed.length + '\tfailed tests');

      if(failed.length) console.log(failed.map(function(f) {
        return '    ✘ ' + f;
      }).join('\n'));
      console.log();

      process.exit(failed.length);
    }
    runTest(tests[++index], next);
  }
  runTest(tests[0], next);
}

// extract npm config information from process.env and process.argv and returns
// a Hash object with key / value pair.
//
// - obj    - the object to parse, default to process.env
// - filter - the RegExp prefix filter to apply on obj keys, defaults to
// `npm_config_`. It also replaces prefix in returned hash object keys.
//
function npmConfig(obj, filter) {
  obj = obj || process.env;
  filter = filter || /^npm_config_/;

  var f = /^--?/;
  var args = process.argv.slice(2).map(function(value, i, arr) {
    var n = f.test(value) ? value : '',
      val = n ? arr[i + 1] : value;

    return {
      name: n.replace(f, ''),
      value: val || true
    }
  });

  args = args.filter(function(o) { return o.name }).reduce(function(a, b) {
    a[b.name] = b.value;
    return a;
  }, {});

  var opts = Object.keys(process.env);
  opts = opts.filter(function(opt) {
    return filter.test(opt);
  });

  opts = opts.map(function(opt) {
    return {
      name: opt,
      value: process.env[opt]
    }
  });

  opts = opts.reduce(function(a, b) {
    a[b.name.replace(filter, '')] = b.value;
    return a;
  }, {});

  // shallow copy of argv hash into opts to merge the two
  opts = (function(obj, source) {
    for (var prop in source) {
      obj[prop] = source[prop];
    }
    return obj;
  })(opts, args);

  return opts;
}
