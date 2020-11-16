'use strict'; // coppied from https://github.com/sindresorhus/serialize-error/blob/master/index.js and converted
// to use _.entries instead of Object.entries. and linted for our standards

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const _require = require('lodash'),
      entries = _require.entries;

const destroyCircular = (from, seen) => {
  const to = Array.isArray(from) ? [] : {};
  seen.push(from);

  var _iterator = _createForOfIteratorHelper(entries(from)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];

      if (typeof value === 'function') {
        continue;
      }

      if (!value || typeof value !== 'object') {
        to[key] = value;
        continue;
      }

      if (!seen.includes(from[key])) {
        to[key] = destroyCircular(from[key], seen.slice());
        continue;
      }

      to[key] = '[Circular]';
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  const commonProperties = ['name', 'message', 'stack', 'code'];

  for (var _i = 0, _commonProperties = commonProperties; _i < _commonProperties.length; _i++) {
    const property = _commonProperties[_i];

    if (typeof from[property] === 'string') {
      to[property] = from[property];
    }
  }

  return to;
};

const serializeError = value => {
  if (typeof value === 'object') {
    return destroyCircular(value, []);
  } // People sometimes throw things besides Error objects…


  if (typeof value === 'function') {
    // `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.
    return `[Function: ${value.name || 'anonymous'}]`;
  }

  return value;
};

module.exports = serializeError; // TODO: Remove this for the next major release

module.exports.default = serializeError;
//# sourceMappingURL=serializeError.js.map