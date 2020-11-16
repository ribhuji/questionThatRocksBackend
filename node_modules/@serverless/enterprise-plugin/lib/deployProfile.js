'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      getDeployProfile = _require.getDeployProfile;

module.exports.configureDeployProfile = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);
    const deploymentProfile = yield getDeployProfile({
      accessKey,
      stage: ctx.provider.getStage(),
      app: ctx.sls.service.app,
      tenant: ctx.sls.service.org
    });

    if (deploymentProfile.providerCredentials) {
      ctx.provider.cachedCredentials = deploymentProfile.providerCredentials.secretValue;
      ctx.provider.cachedCredentials.region = ctx.provider.getRegion();
    }

    ctx.safeguards = deploymentProfile.safeguardsPolicies;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=deployProfile.js.map