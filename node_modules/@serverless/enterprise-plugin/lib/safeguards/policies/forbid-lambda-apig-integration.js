'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const allowedIntegrationTypes = ['LAMBDA_PROXY', 'AWS_PROXY'];

module.exports = function allowedRuntimesPolicy(policy, service) {
  let failed = false;

  for (var _i = 0, _Object$keys = Object.keys(service.declaration.functions); _i < _Object$keys.length; _i++) {
    const fnName = _Object$keys[_i];

    var _iterator = _createForOfIteratorHelper(service.declaration.functions[fnName].events || []),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const eventTrigger = _step.value;

        if (eventTrigger.http && !allowedIntegrationTypes.includes((eventTrigger.http.integration || 'LAMBDA_PROXY').toUpperCase().replace('-', '_'))) {
          failed = true;
          policy.fail(`Function "${fnName}" is using HTTP integration "${eventTrigger.http.integration}" which does not support instrumentation by the Serverless Dashboard`);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  if (!failed) {
    policy.approve();
  }
};

module.exports.docs = 'http://slss.io/sg-forbid-lambda-apig-integration';
//# sourceMappingURL=forbid-lambda-apig-integration.js.map