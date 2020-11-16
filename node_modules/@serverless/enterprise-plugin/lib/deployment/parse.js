'use strict';
/*
 * Save Deployment
 * - This uses the new deployment data model.
 */

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const fs = require('fs-extra');

const _ = require('lodash');

const SDK = require('@serverless/platform-sdk');

const getServerlessFilePath = require('./getServerlessFilePath');

const simpleGit = require('simple-git/promise');

const _require = require('../../package'),
      packageJsonVersion = _require.version;

const git = simpleGit();
git.silent(true);
/*
 * Parse Deployment Data
 * - Takes data from the Framework and formats it into our data model
 */

const parseDeploymentData = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx, status = 'success', error = null, archived = false) {
    const service = ctx.sls.service;
    const deployment = new SDK.Deployment();
    const accountId = yield ctx.provider.getAccountId();
    const serverlessFileName = yield getServerlessFilePath(ctx.sls.processedInput.options.config, ctx.sls.config.servicePath);
    const serverlessFile = (yield fs.readFile(serverlessFileName)).toString();
    /*
     * Add deployment data...
     */

    if (!archived) {
      const cfnStack = yield _asyncToGenerator(function* () {
        try {
          return yield ctx.provider.request('CloudFormation', 'describeStacks', {
            StackName: ctx.provider.naming.getStackName()
          });
        } catch (requestError) {
          const providerError = requestError.providerError;

          if (providerError) {
            // 400 means stack was not deployed yet (first deployment failed)
            if (providerError.statusCode === 400) return null;
          }

          throw requestError;
        }
      })();
      let logsRoleArn;

      if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.logAccessIamRole) {
        logsRoleArn = ctx.sls.service.custom.enterprise.logAccessIamRole;
      } else {
        // get log access role info
        const logsRole = cfnStack && _.find(cfnStack.Stacks[0].Outputs, ({
          OutputKey
        }) => OutputKey === 'EnterpriseLogAccessIamRole');

        logsRoleArn = logsRole && logsRole.OutputValue;
      }

      let logIngestMode = 'push';

      if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.logIngestMode) {
        logIngestMode = 'pull';
      } // get any CFN outputs


      const outputs = service.outputs || {};

      var _iterator = _createForOfIteratorHelper(_.entries(outputs)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          const _step$value = _slicedToArray(_step.value, 2),
                outputKey = _step$value[0],
                outputValue = _step$value[1];

          if (typeof outputValue === 'string' && outputValue.startsWith('CFN!?')) {
            if (cfnStack) {
              const cfnOutput = _.find(cfnStack.Stacks[0].Outputs, ({
                OutputKey
              }) => OutputKey === `${outputValue.slice(5)}`);

              outputs[outputKey] = cfnOutput.OutputValue;
            } else {
              delete outputs[outputKey];
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      deployment.set({
        buildId: process.env.SERVERLESS_BUILD_ID || process.env.SLS_BUILD_ID,
        serverlessFile,
        serverlessFileName,
        versionFramework: ctx.sls.version,
        versionEnterprisePlugin: packageJsonVersion,
        tenantUid: service.orgUid,
        appUid: service.appUid,
        tenantName: service.org,
        appName: service.app,
        serviceName: service.service,
        stageName: ctx.provider.getStage(),
        regionName: ctx.provider.getRegion(),
        deploymentUid: ctx.deploymentUid,
        logsRoleArn,
        archived,
        status,
        provider: {
          type: 'aws',
          aws: {
            accountId
          } // environment: Object.keys(service.provider.environment || {})

        },
        layers: service.layers || {},
        plugins: service.plugins ? service.plugins.modules || service.plugins : [],
        custom: service.custom || {},
        safeguards: ctx.state.safeguardsResults,
        secrets: Array.from(ctx.state.secretsUsed),
        outputs,
        error,
        logIngestMode
      });
      const vcs = {
        type: null
      }; // Add VCS info

      if (process.env.SERVERLESS_CI_CD === 'true') {
        Object.assign(vcs, {
          type: 'git',
          repository: process.env.SERVERLESS_REPO,
          branch: process.env.SERVERLESS_BRANCH,
          pullRequest: process.env.SERVERLESS_PULL_REQUEST,
          committer: process.env.SERVERLESS_COMMIT_USER,
          commit: process.env.SERVERLESS_COMMIT_SHA,
          commitMessage: process.env.SERVERLESS_COMMIT_MSG,
          deployType: process.env.SERVERLESS_DEPLOY_TYPE,
          relativePath: process.env.SERVERLESS_ROOT_PATH
        });
      } else {
        try {
          const isGit = yield git.checkIsRepo();

          if (isGit) {
            vcs.type = 'git';
          }
        } catch (err) {// pass
        }

        if (vcs.type === 'git') {
          const branch = yield git.branch();

          if (branch.current) {
            let origin = yield git.raw(['config', `branch.${branch.current}.remote`]);

            if (origin) {
              origin = origin.trim();
              const remotes = yield git.getRemotes();
              const originRemote = remotes.filter(({
                name
              }) => name === origin)[0];
              if (originRemote) vcs.originUrl = originRemote.refs.fetch;
            }

            vcs.branch = branch.current;
          }

          try {
            vcs.commit = (yield git.raw(['show', '-s', '--format=%H', branch.current || ''])).trim();
          } catch (gitShowError) {
            // Most likely a fresh repo (no commits)
            if (!gitShowError.message.includes('fatal:')) throw gitShowError;
          }

          if (vcs.commit) {
            vcs.commitMessage = (yield git.raw(['show', '-s', '--format=%B', branch.current || ''])).trim();
            vcs.committerEmail = (yield git.raw(['show', '-s', '--format=%ae', branch.current || ''])).trim();
          }

          vcs.relativePath = (yield git.raw(['rev-parse', '--show-prefix'])).trim();
        }
      }

      deployment.set({
        vcs
      });
      /*
       * Add this deployment's functions...
       */

      for (var _i = 0, _Object$keys = Object.keys(service.functions); _i < _Object$keys.length; _i++) {
        const fnName = _Object$keys[_i];
        const fn = service.functions[fnName];
        const deployedFunctionName = fn.name || `${service.service}-${ctx.provider.getStage()}-${fnName}`;
        fn.events = fn.events || []; // Function

        deployment.setFunction({
          name: deployedFunctionName,
          description: fn.description || null,
          timeout: fn.timeout,
          type: 'awsLambda',
          arn: `arn:aws:lambda:${ctx.provider.getRegion()}:${accountId}:function:${deployedFunctionName}`,
          custom: {
            handler: fn.handler,
            memorySize: fn.memory,
            runtime: fn.runtime,
            environment: Object.keys(fn.environment || {}),
            role: fn.role,
            onError: fn.onError,
            awsKmsKeyArn: fn.awsKmsKeyArn,
            tags: fn.tags || {},
            vpc: fn.vpc || {},
            layers: fn.layers || [],
            name: fn.name || fnName
          }
        });
        /*
         * Add this functions's subscriptions...
         */

        var _iterator2 = _createForOfIteratorHelper(fn.events),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            const sub = _step2.value;
            let subDetails = {};
            let type;

            if (typeof sub === 'string') {
              type = sub;
            } else {
              type = Object.keys(sub)[0];

              if ((type === 'http' || type === 'httpApi') && cfnStack) {
                const apigResource = _.find(cfnStack.Stacks[0].Outputs, ({
                  OutputKey
                }) => !OutputKey.endsWith('Websocket') && OutputKey.match(ctx.provider.naming.getServiceEndpointRegex()));

                const apiId = apigResource && apigResource.OutputValue.split('https://')[1].split('.')[0];

                if (typeof sub[type] === 'string') {
                  subDetails = {
                    path: sub[type].split(' ')[1],
                    method: sub[type].split(' ')[0]
                  };
                } else {
                  subDetails = {
                    path: sub[type].path,
                    method: sub[type].method,
                    cors: sub[type].cors,
                    integration: sub[type].integration,
                    authorizer: sub[type].authorizer,
                    timeout: sub[type].timeout
                  };
                }

                if (type === 'http') {
                  subDetails.restApiId = apiId;
                } else {
                  subDetails.httpApiId = apiId;
                }
              } else if (sub[type] instanceof Object) {
                Object.assign(subDetails, sub[type]);
              } else {
                Object.assign(subDetails, {
                  [type]: sub[type]
                });
              }

              if (type === 'websocket' && cfnStack) {
                const apigResource = _.find(cfnStack.Stacks[0].Outputs, ({
                  OutputKey
                }) => OutputKey.endsWith('Websocket') && OutputKey.match(ctx.provider.naming.getServiceEndpointRegex()));

                const apiId = apigResource && apigResource.OutputValue.split('wss://')[1].split('.')[0];
                subDetails.websocketApiId = apiId;
              }
            }

            deployment.setSubscription(_objectSpread({
              type,
              function: deployedFunctionName
            }, subDetails));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } else {
      const vcs = {};

      if (process.env.SERVERLESS_CI_CD === 'true') {
        Object.assign(vcs, {
          type: 'git',
          repository: process.env.SERVERLESS_REPO,
          branch: process.env.SERVERLESS_BRANCH,
          pullRequest: process.env.SERVERLESS_PULL_REQUEST,
          committer: process.env.SERVERLESS_COMMIT_USER,
          commit: process.env.SERVERLESS_COMMIT_SHA,
          commitMessage: process.env.SERVERLESS_COMMIT_MSG,
          deployType: process.env.SERVERLESS_DEPLOY_TYPE,
          relativePath: process.env.SERVERLESS_ROOT_PATH
        });
      }

      deployment.set({
        buildId: process.env.SERVERLESS_BUILD_ID || process.env.SLS_BUILD_ID,
        versionFramework: ctx.sls.version,
        versionEnterprisePlugin: packageJsonVersion,
        tenantUid: service.orgUid,
        appUid: service.appUid,
        tenantName: service.org,
        appName: service.app,
        serviceName: service.service,
        stageName: ctx.provider.getStage(),
        regionName: ctx.provider.getRegion(),
        archived,
        status,
        secrets: Array.from(ctx.state.secretsUsed),
        error,
        vcs
      });
    }

    return deployment;
  });

  return function parseDeploymentData(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = parseDeploymentData;
//# sourceMappingURL=parse.js.map