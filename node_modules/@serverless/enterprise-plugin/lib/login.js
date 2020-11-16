'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      login = _require.login;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    ctx.sls.cli.log('Logging you in via your default browser...'); // Include a "org" in "login()"...
    // This will create a new accessKey for that org on every login.

    try {
      yield login(ctx.sls.service.org);
    } catch (err) {
      if (err === 'Complete sign-up before logging in.') {
        ctx.sls.cli.log("Please complete sign-up at dashboard.serverless.com, then run 'serverless' to configure your service");
        process.exit(1);
      }
    }

    ctx.sls.cli.log('You sucessfully logged in to Serverless.');

    if (!ctx.sls.service.org || !ctx.sls.service.app) {
      ctx.sls.cli.log("Please run 'serverless' to configure your service");
    }

    process.exit(0);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=login.js.map