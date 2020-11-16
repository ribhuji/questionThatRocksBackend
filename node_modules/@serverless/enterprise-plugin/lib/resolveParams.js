'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const memoizee = require('memoizee');

const _require = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      getDeployProfile = _require.getDeployProfile;

module.exports = memoizee( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* ({
    org,
    app,
    stage
  }) {
    const deploymentProfile = yield getDeployProfile({
      accessKey: yield getAccessKeyForTenant(org),
      stage,
      app,
      tenant: org
    });
    const params = Object.create(null);

    var _iterator = _createForOfIteratorHelper(deploymentProfile.secretValues),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const _step$value = _step.value,
              name = _step$value.secretName,
              value = _step$value.secretProperties.value;
        params[name] = value;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return params;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}(), {
  promise: true,
  normalizer: ([{
    org,
    app,
    stage
  }]) => JSON.stringify({
    org,
    app,
    stage
  })
});
//# sourceMappingURL=resolveParams.js.map