'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const moment = require('moment');

const _require = require('iso8601-duration'),
      parse = _require.parse;

module.exports = function restrictedDeployTimesPolicy(policy, service, options = []) {
  const now = moment();

  var _iterator = _createForOfIteratorHelper(Array.isArray(options) ? options : [options]),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      let _step$value = _step.value,
          time = _step$value.time,
          duration = _step$value.duration,
          interval = _step$value.interval;
      time = moment(time);
      duration = moment.duration(parse(duration));
      interval = interval && moment.duration(parse(interval));

      while (time.isBefore(now)) {
        const end = time.clone();
        end.add(duration);

        if (end.isAfter(now)) {
          policy.fail(`Deploying on ${now.format('YYYY-MM-DD')} is not allowed`);
          return;
        }

        if (interval) {
          time.add(interval);
        } else {
          break;
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  policy.approve();
};

module.exports.docs = 'http://slss.io/sg-deploy-times';
//# sourceMappingURL=restricted-deploy-times.js.map