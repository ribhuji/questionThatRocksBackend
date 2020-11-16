'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fetch = require('../fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var accessKey = _ref.accessKey,
        tenant = _ref.tenant,
        name = _ref.name,
        _ref$description = _ref.description,
        description = _ref$description === undefined ? 'A description was not provided for this profile' : _ref$description,
        _ref$secrets = _ref.secrets,
        secrets = _ref$secrets === undefined ? [] : _ref$secrets,
        _ref$safeguardsPolici = _ref.safeguardsPolicies,
        safeguardsPolicies = _ref$safeguardsPolici === undefined ? [] : _ref$safeguardsPolici,
        _ref$providerCredenti = _ref.providerCredentials,
        providerCredentials = _ref$providerCredenti === undefined ? null : _ref$providerCredenti;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _fetch2.default)(`${_config2.default.backendUrl}tenants/${tenant}/deploymentProfiles`, {
              method: 'POST',
              headers: { Authorization: `bearer ${accessKey}` },
              body: JSON.stringify({ name, description, secrets, safeguardsPolicies, providerCredentials })
            });

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
//# sourceMappingURL=createDeploymentProfile.js.map