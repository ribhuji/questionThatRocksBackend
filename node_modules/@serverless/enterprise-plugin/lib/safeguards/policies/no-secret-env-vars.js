'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const _require = require('lodash'),
      entries = _require.entries,
      fromPairs = _require.fromPairs,
      values = _require.values; // from https://github.com/dxa4481/truffleHogRegexes/blob/master/truffleHogRegexes/regexes.json


const truffleHogRegexes = {
  'Slack Token': new RegExp('(xox[p|b|o|a]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})'),
  'RSA private key': new RegExp('-----BEGIN RSA PRIVATE KEY-----'),
  'SSH (OPENSSH) private key': new RegExp('-----BEGIN OPENSSH PRIVATE KEY-----'),
  'SSH (DSA) private key': new RegExp('-----BEGIN DSA PRIVATE KEY-----'),
  'SSH (EC) private key': new RegExp('-----BEGIN EC PRIVATE KEY-----'),
  'PGP private key block': new RegExp('-----BEGIN PGP PRIVATE KEY BLOCK-----'),
  'Facebook Oauth': new RegExp('[f|F][a|A][c|C][e|E][b|B][o|O][o|O][k|K].*[\'|"][0-9a-f]{32}[\'|"]'),
  'Twitter Oauth': new RegExp('[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*[\'|"][0-9a-zA-Z]{35,44}[\'|"]'),
  'GitHub': new RegExp('[g|G][i|I][t|T][h|H][u|U][b|B].*[\'|"][0-9a-zA-Z]{35,40}[\'|"]'),
  'Google Oauth': new RegExp('("client_secret":"[a-zA-Z0-9-_]{24}")'),
  'AWS API Key': new RegExp('AKIA[0-9A-Z]{16}'),
  'Heroku API Key': new RegExp('[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}'),
  'Generic Secret': new RegExp('[s|S][e|E][c|C][r|R][e|E][t|T].*[\'|"][0-9a-zA-Z]{32,45}[\'|"]'),
  'Generic API Key': new RegExp('[a|A][p|P][i|I][_]?[k|K][e|E][y|Y].*[\'|"][0-9a-zA-Z]{32,45}[\'|"]'),
  'Slack Webhook': new RegExp('https://hooks.slack.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}'),
  'Google (GCP) Service-account': new RegExp('"type": "service_account"'),
  'Twilio API Key': new RegExp('SK[a-z0-9]{32}'),
  'Password in URL': new RegExp('[a-zA-Z]{3,10}://[^/\\s:@]{3,20}:[^/\\s:@]{3,20}@.{1,100}["\'\\s]')
};

function isSecret(string) {
  var _iterator = _createForOfIteratorHelper(values(truffleHogRegexes)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const regex = _step.value;

      if (regex.test(string)) {
        return true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return false;
}

module.exports = function noSecretEnvVarsPolicy(policy, service) {
  let failed = false;
  const functions = service.declaration.functions,
        naming = service.provider.naming,
        Resources = service.compiled['cloudformation-template-update-stack.json'].Resources;
  const logicalFuncNamesToConfigFuncName = fromPairs(Object.keys(functions || {}).map(funcName => [naming.getLambdaLogicalId(funcName), funcName]));

  var _iterator2 = _createForOfIteratorHelper(entries(Resources)),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      const _step2$value = _slicedToArray(_step2.value, 2),
            funcName = _step2$value[0],
            _step2$value$ = _step2$value[1],
            Properties = _step2$value$.Properties,
            Type = _step2$value$.Type;

      if (Type !== 'AWS::Lambda::Function' || !Properties.Environment || !Properties.Environment.Variables) {
        continue;
      }

      var _iterator3 = _createForOfIteratorHelper(entries(Properties.Environment.Variables)),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          const _step3$value = _slicedToArray(_step3.value, 2),
                name = _step3$value[0],
                value = _step3$value[1];

          if (isSecret(value)) {
            const configFuncName = logicalFuncNamesToConfigFuncName[funcName] || funcName;
            failed = true;
            policy.fail(`Environment variable ${name} on function '${configFuncName || funcName}' looks like it contains a secret value`);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  if (!failed) {
    policy.approve();
  }
};

module.exports.docs = 'http://slss.io/sg-no-secret-env-vars';
//# sourceMappingURL=no-secret-env-vars.js.map