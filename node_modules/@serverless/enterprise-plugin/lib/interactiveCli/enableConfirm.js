'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('lodash'),
      memoize = _require.memoize;

module.exports = memoize( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (inquirer, options) {
    if (options && (options.org || options.app)) return true;
    process.stdout.write('You can monitor, troubleshoot, and test your new service with a free Serverless account.\n\n');

    const _yield$inquirer$promp = yield inquirer.prompt({
      message: 'Would you like to enable this?',
      type: 'confirm',
      name: 'shouldEnableMonitoring'
    }),
          shouldEnableMonitoring = _yield$inquirer$promp.shouldEnableMonitoring;

    if (!shouldEnableMonitoring) {
      process.stdout.write('You can run the “serverless” command again if you change your mind later.\n');
    }

    process.stdout.write('\n');
    return shouldEnableMonitoring;
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
//# sourceMappingURL=enableConfirm.js.map