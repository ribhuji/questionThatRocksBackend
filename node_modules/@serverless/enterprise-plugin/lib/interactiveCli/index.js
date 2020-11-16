'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const chalk = require('chalk');

const _require = require('@serverless/platform-sdk'),
      getLoggedInUser = _require.getLoggedInUser;

const _require2 = require('@serverless/platform-sdk'),
      getMetadata = _require2.getMetadata;

const _require3 = require('../deployProfile'),
      configureDeployProfile = _require3.configureDeployProfile;

const register = require('./register');

const setApp = require('./set-app');

module.exports = ctx => {
  const hooks = {
    'initialize': function () {
      var _initialize = _asyncToGenerator(function* () {
        if (!ctx.sls.config.servicePath || !ctx.sls.interactiveCli) {
          return;
        }

        if (ctx.sls.processedInput.options.org || ctx.sls.processedInput.options.app) {
          const _yield$getMetadata = yield getMetadata(),
                supportedRuntimes = _yield$getMetadata.supportedRuntimes,
                supportedRegions = _yield$getMetadata.supportedRegions;

          if (ctx.sls.service.provider.name !== 'aws') {
            throw new ctx.sls.classes.Error(`Sorry, the provider ${ctx.sls.service.provider.name} is not yet supported by the dashboard. Check out the docs at http://slss.io/dashboard-requirements" for supported providers.`);
          }

          if (!supportedRuntimes.includes(ctx.sls.service.provider.runtime || 'nodejs12.x')) {
            throw new ctx.sls.classes.Error(`Sorry, the runtime ${ctx.sls.service.provider.runtime} is not yet supported by the dashboard. Check out the docs at http://slss.io/dashboard-requirements" for supported providers.`);
          }

          if (!supportedRegions.includes(ctx.provider.getRegion())) {
            throw new ctx.sls.classes.Error(`Sorry, the region ${ctx.provider.getRegion()} is not yet supported by the dashboard. Check out the docs at http://slss.io/dashboard-requirements" for supported providers.`);
          }
        }
      });

      function initialize() {
        return _initialize.apply(this, arguments);
      }

      return initialize;
    }(),
    'before:interactiveCli:setupAws': function () {
      var _beforeInteractiveCliSetupAws = _asyncToGenerator(function* () {
        const registerCheck = yield register.check(ctx.sls);

        if (registerCheck) {
          process.stdout.write('\n');
          yield register.run(ctx.sls, registerCheck);
        }

        const setAppCheck = yield setApp.check(ctx.sls);

        if (setAppCheck) {
          process.stdout.write('\n');
          yield setApp.run(ctx.sls, setAppCheck);
        }

        if ((registerCheck || setAppCheck) && ctx.sls.service.app && ctx.sls.service.org) {
          process.stdout.write(`
${chalk.green('Your project is setup for monitoring, troubleshooting and testing')}
`); // setup deploy if user already logged in so that AWS creds check in SFO works right
          // & temporarily add provider to ctx to fetch deploy profile

          const user = getLoggedInUser();
          if (user) yield configureDeployProfile(_objectSpread(_objectSpread({}, ctx), {}, {
            provider: ctx.sls.getProvider('aws')
          }));
        }
      });

      function beforeInteractiveCliSetupAws() {
        return _beforeInteractiveCliSetupAws.apply(this, arguments);
      }

      return beforeInteractiveCliSetupAws;
    }(),
    'interactiveCli:end': function () {
      var _interactiveCliEnd = _asyncToGenerator(function* () {
        if (ctx.sls.service.app && ctx.sls.service.org) {
          process.stdout.write(`
${chalk.bold('Deploy your project and monitor, troubleshoot and test it:')}
- Run “serverless deploy” to deploy your service.
- Run “serverless dashboard” to view the dashboard.

`);
        }
      });

      function interactiveCliEnd() {
        return _interactiveCliEnd.apply(this, arguments);
      }

      return interactiveCliEnd;
    }()
  };
  return hooks;
};
//# sourceMappingURL=index.js.map