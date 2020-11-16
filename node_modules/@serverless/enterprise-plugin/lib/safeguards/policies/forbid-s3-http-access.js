'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const _require = require('lodash'),
      entries = _require.entries;

module.exports = function forbidS3HttpAccessPolicy(policy, service) {
  let failed = false;
  const Resources = service.compiled['cloudformation-template-update-stack.json'].Resources;
  const buckets = new Map(entries(Resources).filter(([, {
    Type
  }]) => Type === 'AWS::S3::Bucket'));
  const bucketPolicies = new Map(entries(Resources).filter(([, {
    Type
  }]) => Type === 'AWS::S3::BucketPolicy'));

  var _iterator = _createForOfIteratorHelper(buckets),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const _step$value = _slicedToArray(_step.value, 2),
            bucketName = _step$value[0],
            bucket = _step$value[1];

      let foundMatchingPolicy = false;

      var _iterator2 = _createForOfIteratorHelper(bucketPolicies),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          const _step2$value = _slicedToArray(_step2.value, 2),
                bucketPolicy = _step2$value[1];

          if (bucketPolicy.Properties && (bucketPolicy.Properties.Bucket && bucketPolicy.Properties.Bucket.Ref ? bucketPolicy.Properties.Bucket.Ref === bucketName : bucketPolicy.Properties.Bucket === bucket.Properties.Name) && bucketPolicy.PolicyDocument && bucketPolicy.PolicyDocument.Statement.length && bucketPolicy.PolicyDocument.Statement[0].Action === 's3:*' && bucketPolicy.PolicyDocument.Statement[0].Effect === 'Deny' && bucketPolicy.PolicyDocument.Statement[0].Principal === '*' && (bucketPolicy.PolicyDocument.Statement[0].Resource && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'] ? bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'].length === 2 && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'][0] === '' && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'][1].length === 3 && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'][1][0] === 'arn:aws:s3:::' && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'][1][1].Ref === bucketName && bucketPolicy.PolicyDocument.Statement[0].Resource['Fn::Join'][1][2] === '/*' : bucketPolicy.PolicyDocument.Statement[0].Resource === `arn:aws:s3:::${bucket.Properties.Name}/*`) && bucketPolicy.PolicyDocument.Statement[0].Condition && bucketPolicy.PolicyDocument.Statement[0].Condition.Bool && bucketPolicy.PolicyDocument.Statement[0].Condition.Bool['aws:SecureTransport'] === false && true) {
            foundMatchingPolicy = true;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      if (!foundMatchingPolicy) {
        failed = true;
        policy.fail(`Bucket "${bucketName}" doesn't have a BucketPolicy forbidding unsecure HTTP access.`);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (!failed) {
    policy.approve();
  }
};

module.exports.docs = 'http://slss.io/sg-forbid-s3-http-access';
//# sourceMappingURL=forbid-s3-http-access.js.map