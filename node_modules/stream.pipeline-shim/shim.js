'use strict';

var getPolyfill = require('./polyfill');

var define = require('define-properties');

var stream = require('stream');

module.exports = function shimStreamPipeline() {
  var polyfill = getPolyfill();
  if (polyfill !== stream) {
    define(stream, {pipeline: polyfill}, {
      pipeline: function testpipeline() {
        return stream.pipeline !== polyfill;
      }
    });
  }
  return polyfill;
};
