'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Studio {
  constructor({
    sdk,
    sls,
    serverlessExec
  }) {
    this.sdk = sdk;
    this.serverlessExec = serverlessExec;
    this.sls = sls;
    this.appState = {
      /**
       * This is a 'sls deploy' (not a function deploy). It's required
       * for the initial build, and also any changes to the the serverless.yml
       * file
       */
      isDeploying: false,

      /**
       * Mapping of (function name) <String> -> <Boolean>
       * to determine if a function is already deploying
       */
      isFunctionDeploying: {},

      /**
       * These are populated from the 'sls dev --info' output, which
       * is a combination of a parsed serverless.yml, and outputs
       * from 'serverless info' (namely the endpoints)
       */
      functions: {},
      resources: {},
      endpoints: []
    };
  }

  refreshAppState() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const _yield$_this$serverle = yield _this.serverlessExec.info(),
            output = _yield$_this$serverle.output;

      _this.updateAppState(output);
    })();
  }

  updateAppState(updates = {}) {
    this.appState = _objectSpread(_objectSpread({}, this.appState), updates);
  }

  publishAppState(overrides = {}) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.sdk.publishSync({
        event: 'studio.state',
        data: _objectSpread(_objectSpread({}, _this2.appState), overrides)
      });
    })();
  }

  connect() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.sdk.connect({
        orgName: _this3.sls.service.org,
        onEvent: function () {
          var _onEvent = _asyncToGenerator(function* ({
            event,
            data
          }) {
            const clientType = data.clientType;

            if (event === 'studio.connect') {
              /**
               * If a web client connects to the socket, then send the appState. Also issue
               * another 'studio.connect' to communicate the the CLI is in watch mode. This
               * will handle a case where the web client refreshes.
               */
              if (clientType === 'web') {
                _this3.updateAppState({
                  isWebConnected: true
                });

                yield _this3.sdk.publishSync({
                  event: 'studio.connect',
                  data: {
                    clientType: 'cli'
                  }
                });
                yield _this3.refreshAppState();
                yield _this3.publishAppState();
              }

              if (clientType === 'cli') {
                _this3.updateAppState({
                  isCliConnected: true
                });
              }
            }

            if (event === 'studio.invoke') {
              try {
                yield _this3.serverlessExec.invoke(data);
              } catch (e) {// Error will already get displayed in the CLI
              }
            }
          });

          function onEvent(_x) {
            return _onEvent.apply(this, arguments);
          }

          return onEvent;
        }()
      });

      _this3.sls.cli.log('Connected to the Serverless Platform');
    })();
  }

  deploy({
    isRedeploying,
    functionName
  } = {}) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      if (_this4.appState.isDeploying) {
        return;
      }

      if (!functionName) {
        _this4.sls.cli.log(`${isRedeploying ? 'Re-deploying' : 'Deploying'} to stage "${_this4.serverlessExec.deployToStage}". This may take a few minutes...`);
      }

      _this4.updateAppState({
        isDeploying: !functionName
      });

      yield _this4.publishAppState();
      let hasDeployFailed = false;

      try {
        yield _this4.serverlessExec.deploy(functionName);
      } catch (e) {
        /**
         * If 'sls deploy' fails, the error will be reported to the CLI
         * already. This could happen for many reasons, such as a typo in
         * the .yml. We should catch here to prevent the rest of the watch
         * mode from exiting.
         */
        hasDeployFailed = true;
      }

      if (!hasDeployFailed && !functionName) {
        _this4.sls.cli.log(`Successfully deployed stage "${_this4.serverlessExec.deployToStage}"`);
      }

      _this4.updateAppState({
        isDeploying: false
      });

      yield _this4.refreshAppState();
      yield _this4.publishAppState();
    })();
  }

}

module.exports = Studio;
//# sourceMappingURL=Studio.js.map