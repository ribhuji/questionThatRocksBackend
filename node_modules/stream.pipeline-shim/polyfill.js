'use strict';

var implementation = require('./implementation');

var stream = require('stream');

module.exports = function getPolyfill() {
  if (typeof stream.pipeline === 'function') {
    return stream.pipeline;
  }
  return implementation;
};
