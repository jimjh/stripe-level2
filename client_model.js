// client_model.js
//
// Keeps a running count of
// - sum of requests
// - number of clients
// - sum of requests^2
// in the past x seconds. Eviction of old requests happens when a new request
// is pushed onto the running queue.
//
// == INTERFACE ==
// - push(request) [records a new request]
// - score(client) [z-score of the client, assuming a normal dist.]
//
// The data structures are:
// - linked list of requests
// - map[client] -> num requests
//
// @author Jim Lim - jim@quixey.com
"use strict";
var LinkedList = require('linkedlist');

/**
 * @param expirySecs Number lifetime of request in number of seconds
 */
module.exports = function(expirySecs, confidenceThreshold) {
  Object.defineProperty(this, '_expiry', { value: expirySecs });
  Object.defineProperty(this, '_confi',  { value: confidenceThreshold });
  this._requests = new LinkedList();
  this._clients  = {};
  this._total    = 0;
  this._total2   = 0;
  this._count    = 0;
}

/**
 * Records a new request
 * @param ip   String ip address
 * @param date Date   date of request
 */
module.exports.prototype.push = function(ip, date) {
  var item = new Request(ip, date);
  expire(this, date);
  append(this, item);
}

/**
 * Gets the z-score of the given client, assuming a normal distribution.
 * @return score
 */
module.exports.prototype.score = function(client) {
  if (this._requests.length < this._confi) return 0;
  var mean = this._total / this._count,
     stdev = Math.sqrt(this._total2 / this._count - Math.pow(mean, 2));
  return (this._clients[client] - mean) / stdev;
}

var Request = function(ip, date) {
  this.ip   = ip;
  this.date = date;
}

function expire(model, date) {
  var limit = new Date(date.getTime() - model._expiry * 1000);
  var reqs  = model._requests;
  while(reqs.length && reqs.current.date < limit) {
    var req = reqs.shift();
    var org = model._clients[req.ip];
    model._total  -= 1;
    model._total2 -= 2 * org - 1;
    model._clients[req.ip] -= 1;
    if (0 == model._clients[req.ip]) {
      // last request for this client
      delete model._clients[req.ip];
      model._count--;
    }
  }
}

function append(model, item) {
  model._requests.push(item);
  var org = 0;
  if (item.ip in model._clients) {
    // existing client
    org = model._clients[item.ip];
    model._clients[item.ip] += 1;
  } else {
    // new client
    model._clients[item.ip] = 1;
    model._count += 1;
  }
  model._total  += 1;
  model._total2 += 2 * org + 1;
}
