'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      removeLogDestination = _require.removeLogDestination;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    if (!ctx.sls.service.custom || !ctx.sls.service.custom.enterprise || !ctx.sls.service.custom.enterprise.collectLambdaLogs) {
      return;
    }

    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);
    const destinationOpts = {
      accessKey,
      appUid: ctx.sls.service.appUid,
      tenantUid: ctx.sls.service.orgUid,
      serviceName: ctx.sls.service.getServiceName(),
      stageName: ctx.provider.getStage(),
      regionName: ctx.provider.getRegion()
    };
    yield removeLogDestination(destinationOpts);
    return;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=removeDestination.js.map