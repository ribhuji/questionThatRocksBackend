'use strict';
/*
 * Wrap Clean
 * - Cleans up files create during wrapping
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const fs = require('fs-extra');

const path = require('path');

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    // Clear assets (serverless-sdk)
    if (fs.pathExistsSync(ctx.state.pathAssets)) {
      fs.removeSync(ctx.state.pathAssets);
    }

    for (var _i = 0, _Object$keys = Object.keys(ctx.state.functions); _i < _Object$keys.length; _i++) {
      const func = _Object$keys[_i];
      const fn = ctx.state.functions[func];
      let file;

      if (fn.runtime.includes('node')) {
        file = `${fn.entryNew}.js`;
      } else if (fn.runtime.includes('python')) {
        file = `${fn.entryNew}.py`;
      }

      const filePath = path.join(ctx.sls.config.servicePath, file); // Clear wrapper file for this function

      if (fs.pathExistsSync(filePath)) {
        fs.removeSync(filePath);
      }
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=wrapClean.js.map