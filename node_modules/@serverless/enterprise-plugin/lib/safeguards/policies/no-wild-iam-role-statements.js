'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const _require = require('lodash'),
      values = _require.values;

module.exports = function noWildIamPolicy(policy, service) {
  let failed = false;
  const Resources = service.compiled['cloudformation-template-update-stack.json'].Resources;

  var _iterator = _createForOfIteratorHelper(values(Resources)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const _step$value = _step.value,
            Type = _step$value.Type,
            Properties = _step$value.Properties;

      if (Type !== 'AWS::IAM::Role') {
        continue;
      }

      var _iterator2 = _createForOfIteratorHelper(Properties.Policies || []),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          const iamPolicy = _step2.value;

          var _iterator3 = _createForOfIteratorHelper(iamPolicy.PolicyDocument.Statement),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              const _step3$value = _step3.value,
                    Effect = _step3$value.Effect,
                    Action = _step3$value.Action,
                    Resource = _step3$value.Resource;

              if (Effect === 'Deny') {
                continue;
              }

              var _iterator4 = _createForOfIteratorHelper(Action),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  const action = _step4.value;

                  if (action === '*') {
                    failed = true;
                    policy.fail("iamRoleStatement granting Action='*'. Wildcard actions in iamRoleStatements are not permitted.");
                  }

                  if (action.split(':')[1] === '*') {
                    failed = true;
                    policy.fail(`iamRoleStatement granting Action='${action}'. Wildcard actions in iamRoleStatements are not permitted.`);
                  }
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }

              var _iterator5 = _createForOfIteratorHelper(Array.isArray(Resource) ? Resource : [Resource]),
                  _step5;

              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  const rawResource = _step5.value;
                  let resourceStr = rawResource;

                  if (typeof rawResource === 'object') {
                    if ('Fn::Join' in rawResource) {
                      resourceStr = rawResource['Fn::Join'][1].join(rawResource['Fn::Join'][0]);
                    } else if ('Fn::Sub' in rawResource) {
                      if (typeof rawResource['Fn::Sub'] === 'string') {
                        resourceStr = rawResource['Fn::Sub'].replace(/\$\{[^$]*\}/g, 'variable');
                      } else {
                        resourceStr = rawResource['Fn::Sub'][0].replace(/\$\{[^$]*\}/g, 'variable');
                      }
                    }
                  }

                  if (resourceStr === '*') {
                    failed = true;
                    policy.fail("iamRoleStatement granting Resource='*'. Wildcard resources in iamRoleStatements are not permitted.");
                  } else if (typeof resourceStr === 'string') {
                    const _resourceStr$split = resourceStr.split(':'),
                          _resourceStr$split2 = _slicedToArray(_resourceStr$split, 7),
                          arnService = _resourceStr$split2[2],
                          resourceType = _resourceStr$split2[5],
                          resource = _resourceStr$split2[6];

                    if (arnService === '*' || resourceType === '*' || resource === '*') {
                      failed = true;
                      policy.fail(`iamRoleStatement granting Resource=${JSON.stringify(rawResource)}. Wildcard resources or resourcetypes in iamRoleStatements are not permitted.`);
                    }
                  } else {
                    /*
                     * if resourceStr isn't a string, it's probably an object
                     * containing a `Ref` or CFN function like `Fn::GetAtt` which are difficult to resolve
                     * cases like `Ref` are most likely safe. Explicitly bad cases using `Fn::Join` with
                     * all literals, are handled above.
                     */
                  }
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
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

module.exports.docs = 'http://slss.io/sg-no-wild-iam-role';
//# sourceMappingURL=no-wild-iam-role-statements.js.map