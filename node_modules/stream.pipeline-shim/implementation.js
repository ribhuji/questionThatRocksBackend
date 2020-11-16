'use strict';

// Ported from https://github.com/nodejs/node/blob/master/lib/internal/streams/pipeline.js
// which was ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).

var eos = require('stream.finished');

function once(callback) {
  var called = false;
  return function(err) {
    if (called) return;
    called = true;
    callback(err);
  };
}

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);

  var closed = false;
  stream.on('close', function() {
    closed = true;
  });

  eos(stream, {readable: reading, writable: writing}, function(err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });

  var destroyed = false;
  return function(err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();

    if (!err) {
      err = new Error('Cannot call pipe after a stream was destroyed');
      err.code = 'ERR_STREAM_DESTROYED';
      err.name = 'Error [ERR_STREAM_DESTROYED]';
    }
    callback(err);
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var len = arguments.length, streams = Array(len), key = 0; key < len; key++) {
    streams[key] = arguments[key];
  }

  var callback = popCallback(streams);

  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    var argsError = new Error('The "streams" argument must be specified');
    argsError.code = 'ERR_MISSING_ARGS';
    argsError.name = 'TypeError [ERR_MISSING_ARGS]';
    throw argsError;
  }

  var error;
  var destroys = streams.map(function(stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function(err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });

  return streams.reduce(pipe);
}

module.exports = pipeline;
