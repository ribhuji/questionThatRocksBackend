'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const path = require('path');

const chokidar = require('chokidar');

const _require = require('@serverless/platform-client'),
      ServerlessSDK = _require.ServerlessSDK;

const _require2 = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require2.getAccessKeyForTenant;

const _require3 = require('lodash'),
      isEqual = _require3.isEqual;

const findProcess = require('find-process');

const isAuthenticated = require('./isAuthenticated');

const throwAuthError = require('./throwAuthError'); // Studio components


const Studio = require('./studio/Studio');

const ServerlessExec = require('./studio/ServerlessExec');
/**
 * All serverless configuration file variants will be watched. Note that the absolute
 * path for this files is computed, since that is how chokidar is configured to watch
 * these files.
 */


const possibleServerlessConfigFileVariants = ['serverless.yml', 'serverless.yaml', 'serverless.json', 'serverless.js'].map(configFile => path.resolve(configFile));

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    const _ctx$sls = ctx.sls,
          _ctx$sls$service = _ctx$sls.service,
          app = _ctx$sls$service.app,
          org = _ctx$sls$service.org,
          ServerlessError = _ctx$sls.classes.Error;
    const sls = ctx.sls;

    if (!isAuthenticated()) {
      throwAuthError(sls);
    }

    if (!org) throw new ServerlessError('Missing `org` setting', 'DASHBOARD_MISSING_ORG');
    if (!app) throw new ServerlessError('Missing `app` setting', 'DASHBOARD_MISSING_APP');
    let deployToStage = ctx.provider.getStage();
    const deployToRegion = ctx.provider.getRegion();
    const _sls$processedInput$o = sls.processedInput.options,
          info = _sls$processedInput$o.info,
          autoStage = _sls$processedInput$o.autoStage;
    /**
     * If specified, automatically pick a random stage, and remove it on exit
     */

    if (autoStage) {
      deployToStage = `${process.env.USER || 'studio'}-${Math.floor(Math.random() * 100000)}`;
    }

    const serverlessExec = new ServerlessExec(deployToStage, deployToRegion);
    /**
     * Informational flag, used by parent watch process
     */

    if (info) {
      const endpoints = yield serverlessExec.fetchEndpoints();
      /**
       * Communicate relevant configuration settings to the parent process (sls studio):
       *
       *  - General app/org information
       *  - Send new infra/functions to websocket
       *  - Detect new functions to watch
       */

      process.stdout.write(JSON.stringify({
        meta: {
          app: sls.service.app,
          org: sls.service.org,
          service: sls.service.service,
          region: deployToRegion,
          stage: deployToStage
        },
        functions: sls.service.functions,
        resources: sls.service.resources,
        endpoints
      }));
      return;
    }

    sls.cli.log('Starting Serverless Studio...');
    /**
     * As a pseudo-failsafe, don't support the prod stage to limit WebSocket traffic
     */

    if (deployToStage === 'prod') {
      sls.cli.log("Stage 'prod' cannot be used with 'serverless studio'");
      return;
    }
    /**
     * Check to see if 'serverless studio' is already running
     */


    const processes = yield findProcess('name', /(serverless|sls) studio/g);

    if (processes.length === 0) {
      sls.cli.log('Failed to detect running serverless process. Exiting.');
      return;
    }
    /**
     * Only one process can be running
     */


    if (processes.length > 1) {
      sls.cli.log("Only one instance of 'serverless studio' can be running");
      return;
    }

    const accessKey = yield getAccessKeyForTenant(sls.service.org);
    const sdk = new ServerlessSDK({
      platformStage: process.env.SERVERLESS_PLATFORM_STAGE || 'prod',
      accessKey
    });
    const studio = new Studio({
      sdk,
      sls,
      serverlessExec
    });
    /**
     * Connect to the WebSocket
     */

    yield studio.connect();
    yield sdk.publishSync({
      event: 'studio.connect',
      data: {
        clientType: 'cli'
      }
    });

    if (autoStage) {
      sls.cli.log(`Auto stage generation enabled. Will deploy to stage: "${deployToStage}"...`);
      sls.cli.log(`Note: exiting Studio will remove stage "${deployToStage}"...`);
    }

    const disconnect = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* () {
        if (sdk.isConnected()) {
          yield sdk.publishSync({
            event: 'studio.disconnect',
            data: {
              clientType: 'cli'
            }
          });
          yield sdk.disconnect();
          process.stdout.write('\n');
          sls.cli.log('Disconnected from the Serverless Platform');
        }
      });

      return function disconnect() {
        return _ref2.apply(this, arguments);
      };
    }();

    const cleanup = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* () {
        yield disconnect();
        /**
         * Tear down the stage if in "auto-stage" mode
         */

        if (autoStage) {
          process.stdout.write('\n');
          sls.cli.log(`Cleaning up stage "${deployToStage}"...`);
          yield serverlessExec.remove();
        }

        process.exit(0);
      });

      return function cleanup() {
        return _ref3.apply(this, arguments);
      };
    }();

    let filenameToFunctionsMapping = {};
    /**
     * Capture ctrl+c and remove the stage that we setup
     */

    process.on('SIGINT', cleanup);
    process.on('uncaughtException', disconnect);
    process.on('exit', cleanup);
    /**
     * Communicate initial state of the serverless.yml
     */

    sls.cli.log('Sending initial app state...');
    yield studio.refreshAppState();
    yield studio.publishAppState({
      isDeploying: true
    });
    /**
     * Deploy the serverless.yml file
     */

    yield studio.deploy();
    /**
     * Compute new watch files. Only rewatch new files if parsing the serverless.yml file is successfull.
     */

    const rewatchFiles = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* () {
        /**
         * Compute new watch files. Only rewatch new files if parsing the serverless.yml file is successfull.
         */
        const _yield$serverlessExec = yield serverlessExec.info(),
              filenameToFunctions = _yield$serverlessExec.filenameToFunctions,
              trackedFiles = _yield$serverlessExec.trackedFiles;

        filenameToFunctionsMapping = filenameToFunctions;
        /**
         * Remove all paths
         */

        yield watcher.unwatch('*');
        /**
         * Re-watch new files
         */

        watcher.add([...possibleServerlessConfigFileVariants, ...trackedFiles]);
      });

      return function rewatchFiles() {
        return _ref4.apply(this, arguments);
      };
    }();
    /**
     * Create a new watcher. By default don't watch anything. The serverless.yml file
     * will be parsed for function handlers. Those handlers will have their dependency
     * trees mapped, and those files will be added dynamically by `rewatchFiles()`
     */


    const watcher = chokidar.watch([], {
      /**
       * Tracked files are absolute, and explicit. By default cwd is the currently working directory,
       * which means the mapping between function and files will be wrong.
       */
      cwd: '/'
    });
    sls.cli.log('Building function dependency watch list...');
    yield rewatchFiles();
    sls.cli.log(`Tracking ${Object.keys(serverlessExec.functionToFilenames).length} function handler(s), and their dependencies...`);
    watcher.on('ready', () => {
      sls.cli.log('Watching for changes...');
    });
    /**
     * Watch for file changes
     */

    watcher.on('change', /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (filepath) {
        const isFunctionDeploying = studio.appState.isFunctionDeploying;
        /**
         * Force resolved file path to be absolute.
         */

        const resolvedFilepath = path.normalize(`${path.sep}${filepath}`);
        /**
         * A serverless.ya(m)l file has changed
         */

        if (possibleServerlessConfigFileVariants.includes(resolvedFilepath) && !studio.appState.isDeploying) {
          sls.cli.log('serverless configuration changed. Checking for function changes...');
          /**
           * Compare the function (names) in the serverless.yml file
           * with what's already in the app state. We need to redeploy
           * the stack if:
           *
           *  1. A new function has ben added
           *  2. A function has been renamed
           *  3. If you change settings of a function
           */

          const _yield$serverlessExec2 = yield serverlessExec.info(),
                functions = _yield$serverlessExec2.functions;

          if (!isEqual(functions, studio.appState.functions)) {
            sls.cli.log('Detected function configuration changes...');
            sls.cli.log(`Stage "${deployToStage}" will be redeployed to reflect these changes...`);
            yield studio.deploy({
              isRedeploying: true
            });
            rewatchFiles();
          } else {
            sls.cli.log('No function changes detected. Continuing...');
          }

          return;
        }

        const functionNames = filenameToFunctionsMapping[resolvedFilepath];

        if (!functionNames) {
          return;
        }
        /**
         * Only deploy a function that is not already deploying
         */


        const functionsNeedingDeploy = [...functionNames].filter(functionName => !isFunctionDeploying[functionName]);
        /**
         * Mark all functions as deploying, and communicate that state
         */

        functionsNeedingDeploy.forEach(functionName => {
          sls.cli.log(`${functionName}: changed. Redeploying...`);
          isFunctionDeploying[functionName] = true;
        });

        if (functionsNeedingDeploy.length > 0) {
          yield studio.publishAppState();
        }
        /**
         * Redeploy all changed functions
         */


        yield Promise.all(functionsNeedingDeploy.map( /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator(function* (functionName) {
            /**
             * Redeploy the function
             */
            try {
              yield studio.deploy({
                isRedeploying: true,
                functionName
              });
            } catch (e) {
              /**
               * This ocassionally fails, although I haven't yet been able
               * to track down why.
               */
            } finally {
              isFunctionDeploying[functionName] = false;
            }
          });

          return function (_x3) {
            return _ref6.apply(this, arguments);
          };
        }()));

        if (functionsNeedingDeploy.length > 0) {
          yield studio.publishAppState();
          sls.cli.log('Watching for changes...');
        }
      });

      return function (_x2) {
        return _ref5.apply(this, arguments);
      };
    }());
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=studio.js.map