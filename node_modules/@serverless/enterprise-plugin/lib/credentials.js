'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      getCredentials = _require.getCredentials,
      getAccessKeyForTenant = _require.getAccessKeyForTenant;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    if (!process.env.SLS_CLOUD_ACCESS) {
      return;
    }

    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);

    const _yield$getCredentials = yield getCredentials({
      accessKey,
      stageName: ctx.provider.getStage(),
      command: ctx.sls.processedInput.commands[0],
      app: ctx.sls.service.app,
      tenant: ctx.sls.service.org,
      service: ctx.sls.service.getServiceName()
    }),
          accessKeyId = _yield$getCredentials.accessKeyId,
          secretAccessKey = _yield$getCredentials.secretAccessKey,
          sessionToken = _yield$getCredentials.sessionToken;

    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
    process.env.AWS_SESSION_TOKEN = sessionToken;
    ctx.sls.cli.log('Cloud credentials set from Serverless Platform.');
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=credentials.js.map