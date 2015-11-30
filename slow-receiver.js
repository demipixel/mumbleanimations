"use strict";

var stream = require("stream"),
    util = require("util");

var SlowReceiver = function(delay) {
  stream.Transform.call(this);

  this.delay = delay || 1000;

  this._transform = function(chunk, encoding, callback) {
    return setTimeout(function() {
      this.push(chunk);
      return callback();
    }.bind(this), this.delay);
  };
};

util.inherits(SlowReceiver, stream.Transform);

module.exports = SlowReceiver;