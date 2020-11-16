'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const chalk = require('chalk');

const _require = require('util'),
      inspect = _require.inspect;
/*
 * Logs Collection
 * - Collects `SERVERLESS PLATFORM || REPORT` from lambda logs
 * - Collects `sls-access-logs` from API Gateway access logs
 */


const _require2 = require('./utils'),
      pickResourceType = _require2.pickResourceType,
      upperFirst = _require2.upperFirst,
      API_GATEWAY_FILTER_PATTERN = _require2.API_GATEWAY_FILTER_PATTERN,
      API_GATEWAY_V2_FILTER_PATTERN = _require2.API_GATEWAY_V2_FILTER_PATTERN,
      LAMBDA_FILTER_PATTERN = _require2.LAMBDA_FILTER_PATTERN;

const _require3 = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require3.getAccessKeyForTenant,
      getLogDestination = _require3.getLogDestination;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.collectLambdaLogs === false) {
      ctx.sls.cli.log('Info: This plugin is not configured to collect AWS Lambda Logs.');
      return;
    }

    if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.logIngestMode === 'pull') {
      ctx.sls.cli.log('Info: Log ingestion is configured to pull-based ingestion.');
      return;
    }

    const template = ctx.sls.service.provider.compiledCloudFormationTemplate; // Gather possible targets

    const logGroups = pickResourceType(template, 'AWS::Logs::LogGroup');

    if (logGroups.length === 0) {
      return;
    }

    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);

    const _yield$ctx$provider$r = yield ctx.provider.request('STS', 'getCallerIdentity', {}),
          Account = _yield$ctx$provider$r.Account;

    const destinationOpts = {
      accessKey,
      appUid: ctx.sls.service.appUid,
      tenantUid: ctx.sls.service.orgUid,
      serviceName: ctx.sls.service.getServiceName(),
      stageName: ctx.provider.getStage(),
      regionName: ctx.provider.getRegion(),
      accountId: Account
    };
    let destinationArn;

    try {
      var _yield$getLogDestinat = yield getLogDestination(destinationOpts);

      destinationArn = _yield$getLogDestinat.destinationArn;
    } catch (e) {
      if (e.message && e.message.includes('not supported in region')) {
        ctx.sls.cli.log(chalk.keyword('orange')(`Warning: Lambda log collection is not supported in ${ctx.provider.getRegion()}`));
        return;
      }

      throw new Error(e.message);
    } // For each log group, set up subscription


    for (var _i = 0, _Object$keys = Object.keys(logGroups); _i < _Object$keys.length; _i++) {
      const logGroupIndex = _Object$keys[_i];
      const logGroupKey = logGroups[logGroupIndex].key;
      let logGroupName = logGroups[logGroupIndex].resource.Properties.LogGroupName;

      if (typeof logGroupName !== 'string') {
        if (!logGroupName || !logGroupName['Fn::Join']) {
          throw new Error(`Unable to resolve '${logGroupIndex}' log group name out of: ${inspect(logGroups[logGroupIndex].resource.Properties)}`);
        }

        if (logGroupName['Fn::Join']) {
          logGroupName = logGroupName['Fn::Join'][1].join(logGroupName['Fn::Join'][0]);
        } else {
          continue;
        }
      }

      let filterPattern = LAMBDA_FILTER_PATTERN;

      if (logGroupName.startsWith('/aws/api-gateway/')) {
        filterPattern = API_GATEWAY_FILTER_PATTERN;
      } else if (logGroupName.startsWith('/aws/http-api/')) {
        filterPattern = API_GATEWAY_V2_FILTER_PATTERN;
      }

      template.Resources[`CloudWatchLogsSubscriptionFilter${upperFirst(logGroupKey)}`] = {
        Type: 'AWS::Logs::SubscriptionFilter',
        Properties: {
          DestinationArn: destinationArn,
          FilterPattern: filterPattern,
          LogGroupName: {
            Ref: logGroupKey
          }
        }
      };
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=logsCollection.js.map