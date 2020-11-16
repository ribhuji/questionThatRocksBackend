'use strict';

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _jwtDecode = require('jwt-decode');

var _jwtDecode2 = _interopRequireDefault(_jwtDecode);

var _package = require('../../package.json');

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _openBrowser = require('./openBrowser');

var _openBrowser2 = _interopRequireDefault(_openBrowser);

var _accessKeys = require('../accessKeys');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _loginIdentity = require('./loginIdentity');

var _loginIdentity2 = _interopRequireDefault(_loginIdentity);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Login
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * - Logs user in via CLI.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * - Loads and updates data in user's .serverlessrc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var login = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(tenant) {
    var configFile, loginIdentityPromises, transactionId, scope, AUTH0_DOMAIN, auth0Queries, auth0Endpoint, data, decoded, id, expiresAt, updatedConfigFile, accessKey;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Load local configuration file
            configFile = utils.readConfigFile();

            if (configFile) {
              _context.next = 3;
              break;
            }

            throw new Error(`Serverless Enterprise requires a .serverlessrc file in the project's directory or root directory of this machine.`);

          case 3:
            loginIdentityPromises = (0, _loginIdentity2.default)();
            _context.next = 6;
            return loginIdentityPromises.transactionId;

          case 6:
            transactionId = _context.sent;
            scope = ['openid', 'email_verified', 'email', 'profile', 'name', 'offline_access'];
            AUTH0_DOMAIN = _config2.default.auth0Domain;
            auth0Queries = _querystring2.default.stringify({
              audience: `https://${AUTH0_DOMAIN}/userinfo`,
              response_type: 'code',
              client_id: _config2.default.auth0ClientId,
              redirect_uri: `${_config2.default.frontendUrl}callback?transactionId=${transactionId}`,
              scope: scope.join(' ')
            });
            auth0Endpoint = `https://${AUTH0_DOMAIN}/authorize?${auth0Queries}`;
            _context.next = 13;
            return (0, _openBrowser2.default)(auth0Endpoint);

          case 13:
            _context.next = 15;
            return loginIdentityPromises.loginData;

          case 15:
            data = _context.sent;
            decoded = (0, _jwtDecode2.default)(data.id_token);
            id = decoded.tracking_id || decoded.sub;
            expiresAt = data.expires_in ? Date.now() + data.expires_in : data.expires_at;

            configFile.userId = id;
            configFile.users = configFile.users || {};
            configFile.users[id] = {
              userId: id,
              name: decoded.name,
              email: decoded.email,
              username: data.username,
              dashboard: {
                refreshToken: data.refresh_token,
                accessToken: data.access_token,
                idToken: data.id_token,
                expiresAt: expiresAt,
                username: data.username
              }

              // Ensure accessKeys object exists
            };if (!configFile.users[id].dashboard.accessKeys) {
              configFile.users[id].dashboard.accessKeys = {};
            }

            // Add enterprise object
            configFile.users[id].enterprise = configFile.users[id].enterprise || {};
            configFile.users[id].enterprise.versionSDK = _package.version;
            configFile.users[id].enterprise.timeLastLogin = Math.round(+new Date() / 1000);

            // Write updated data to .serverlessrc
            updatedConfigFile = utils.writeConfigFile(configFile);

            // If tenant is included, update config w/ new accesskey for that tenant

            accessKey = void 0;

            if (!(tenant && tenant !== 'tenantname')) {
              _context.next = 33;
              break;
            }

            _context.next = 31;
            return (0, _accessKeys.createAccessKeyForTenant)(tenant);

          case 31:
            accessKey = _context.sent;

            if (accessKey) {
              configFile = utils.readConfigFile();
              configFile.users[id].dashboard.accessKeys[tenant] = accessKey;
              updatedConfigFile = utils.writeConfigFile(configFile);
            }

          case 33:
            return _context.abrupt('return', updatedConfigFile);

          case 34:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function login(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = login;
//# sourceMappingURL=login.js.map