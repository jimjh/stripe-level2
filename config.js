#!/usr/bin/env node
var mustache = require('mustache'),
    nopt     = require('nopt'),
    fs       = require('fs');

function main() {

  var opts = {
    "out-ports": String,
    "in-port": String,
  }

  var parsed = nopt(opts),
      inPort = parsed['in-port'] || '3000',
      outPorts = parsed['out-ports'] ? parsed['out-ports'].split(",") : ['3001'];

  var config = { inPort: inPort, outPorts: outPorts }
  fs.readFile('conf/nginx.conf.tmpl', 'utf8', function(err, data) {
    if (err) throw err
    var output = mustache.render(data, config);
    fs.writeFile('conf/nginx.conf', output, function(err) {
      if (err) throw err;
      console.log('Saved nginx.conf to conf/nginx.conf');
    });
  });
}

main();
