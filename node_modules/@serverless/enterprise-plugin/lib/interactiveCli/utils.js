'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      createAccessKeyForTenant = _require.createAccessKeyForTenant,
      writeConfigFile = _require.writeConfigFile;

module.exports = {
  resolveAccessKey: function () {
    var _resolveAccessKey = _asyncToGenerator(function* (user, orgName) {
      if (user.accessKeys && user.accessKeys[orgName]) return user.accessKeys[orgName];
      const token = yield createAccessKeyForTenant(orgName);
      yield writeConfigFile({
        users: {
          [user.userId]: {
            dashboard: {
              accessKeys: {
                [orgName]: token
              }
            }
          }
        }
      });
      return token;
    });

    function resolveAccessKey(_x, _x2) {
      return _resolveAccessKey.apply(this, arguments);
    }

    return resolveAccessKey;
  }(),
  sleep: timeout => new Promise(resolve => setTimeout(resolve, timeout))
};
//# sourceMappingURL=utils.js.map