'use strict';
/*
 * Archive Service
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      archiveService = _require.archiveService,
      getAccessKeyForTenant = _require.getAccessKeyForTenant;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    // Defaults
    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);
    ctx.sls.cli.log('Archiving this service in the Serverless Dashboard...');
    const data = {
      name: ctx.sls.service.service,
      tenant: ctx.sls.service.org,
      app: ctx.sls.service.app,
      provider: ctx.sls.service.provider.name,
      region: ctx.sls.service.provider.region,
      accessKey
    };
    return archiveService(data).then(() => {
      ctx.sls.cli.log('Successfully archived this service in the Serverless Dashboard...');
    }).catch(err => {
      ctx.sls.cli.log('Failed to archive this service in the Serverless Dashboard...');
      throw new Error(err);
    });
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=archiveService.js.map