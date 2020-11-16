'use strict';

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _isDocker = require('is-docker');

var _isDocker2 = _interopRequireDefault(_isDocker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function openBrowser(url) {
  var browser = process.env.BROWSER;
  if (browser === 'none' || (0, _isDocker2.default)()) {
    console.log(_chalk2.default.green('Please open your browser & open the URL below to login:'));
    console.log(_chalk2.default.yellow(url));
    return false;
  }
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined;
  }
  console.log(_chalk2.default.green('If your browser does not open automatically, please open it &  open the URL below to log in:'));
  console.log(_chalk2.default.yellow(url));
  var options = { wait: false, app: browser };
  return (0, _opn2.default)(url, options).catch(function () {
    return false;
  });
}; /* eslint-disable no-console */
//# sourceMappingURL=openBrowser.js.map