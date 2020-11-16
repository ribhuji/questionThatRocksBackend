'use strict';

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var polyfill = getPolyfill();
var shim = require('./shim');

var define = require('define-properties');
var streamModule = require('stream');

var boundPipeline = function pipeline() {
  return polyfill.apply(streamModule, arguments);
};
define(boundPipeline, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundPipeline;
