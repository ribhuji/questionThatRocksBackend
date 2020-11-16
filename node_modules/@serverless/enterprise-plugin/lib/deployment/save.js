'use strict';
/*
 * Save Deployment
 * - This uses the new deployment data model.
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const parseDeploymentData = require('./parse');

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx, archived = false) {
    ctx.sls.cli.log('Publishing service to the Serverless Dashboard...');
    const deployment = yield parseDeploymentData(ctx, undefined, undefined, archived);
    const result = yield deployment.save();
    ctx.sls.cli.log(`Successfully published your service to the Serverless Dashboard: ${result.dashboardUrl}`);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=save.js.map