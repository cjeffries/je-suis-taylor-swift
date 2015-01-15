'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');

var body = require('body/any');
var xtend = require('xtend');
var router = require('routes')();
var trumpet = require('trumpet');
var ecstatic = require('ecstatic');
var Vote = require('./voter');

var kue = require('kue');
var jobs = kue.createQueue();

jobs.process('vote', 5, function(job, done) {
  return new Vote(job, done);
});

router.addRoute('/test', function(req, res, params) {
  layout(res).end('test');
});

router.addRoute('/submit', post(function(req, res, params) {
  jobs.create('vote', xtend(params, {title: 'A vote from ' + params.firstName + ' ' + params.lastName})).save();
  layout(res).end('<p>Great! You will receive an email with a confirmation link from Triple J soon, make sure you click it. In the meantime, why not tell everyone and help Taylor out by tweeting?</p><br /><p><a class="twitter-share-button" href="https://twitter.com/share" data-text="I just voted for Taylor Swift - Shake It Off in the #hottest100 #JeSuisTaylorSwift #Tay4Hottest100" data-size="large" data-count="none" data-url="http://taylorswift.io">Tweet</a></p>');
}));

var server = http.createServer(function(req, res) {
  var m = router.match(req.url); 
  if(m) m.fn(req, res, m.params);
  else ecstatic(__dirname + '/static')(req, res);
});

kue.app.listen(8088);
server.listen(8080, function() {
  console.log('listening on :' + server.address().port);
});

function post (fn) {
  return function (req, res, params) {
    if (req.method !== 'POST') {
      res.statusCode = 400;
      return res.end('not a POST\n');
    }

    body(req, {}, function(err, pvars) {
      fn(req, res, xtend(pvars, params));
    });
  };
}

function layout(res) {
  var tr = trumpet();
  res.setHeader('content-type', 'text/html');
  read('layout.html').pipe(tr).pipe(res);
  return tr.createWriteStream('#submission');
}

function read(file) {
  return fs.createReadStream(path.join(__dirname, 'static', file));
}
