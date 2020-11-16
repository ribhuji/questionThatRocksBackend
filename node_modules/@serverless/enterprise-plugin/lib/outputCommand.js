'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('lodash'),
      isEmpty = _require.isEmpty,
      isObject = _require.isObject,
      entries = _require.entries;

const chalk = require('chalk');

const cliTable = require('cli-color/columns');

const isAuthenticated = require('./isAuthenticated');

const throwAuthError = require('./throwAuthError');

const resolveOutputs = require('./resolveOutputs');

const resolveOutput = require('./resolveOutput');

const resolveInput = function resolveInput(ctx) {
  const provider = ctx.provider,
        _ctx$sls = ctx.sls,
        _ctx$sls$service = _ctx$sls.service,
        app = _ctx$sls$service.app,
        org = _ctx$sls$service.org,
        service = _ctx$sls$service.service,
        cliOptions = _ctx$sls.processedInput.options,
        ServerlessError = _ctx$sls.classes.Error;
  if (!isAuthenticated()) throwAuthError(ctx.sls);
  if (!org) throw new ServerlessError('Missing `org` setting', 'DASHBOARD_MISSING_ORG');
  if (!app) throw new ServerlessError('Missing `app` setting', 'DASHBOARD_MISSING_APP');
  const serviceName = cliOptions.service || service;

  if (!serviceName) {
    throw new ServerlessError('Missing `service` setting', 'DASHBOARD_MISSING_SERVICE');
  }

  const stage = cliOptions.stage || provider.getStage();
  const region = cliOptions.region || provider.getRegion();
  return {
    app,
    org,
    stage,
    region,
    service: serviceName
  };
};

const stringifyValue = value => {
  if (Array.isArray(value)) {
    return value.map(valueItem => {
      return isObject(valueItem) ? JSON.stringify(valueItem) : valueItem;
    }).join(', ');
  }

  if (isObject(value)) return JSON.stringify(value);
  return value;
};

module.exports = {
  get: function () {
    var _get = _asyncToGenerator(function* (context) {
      const name = context.sls.processedInput.options.name;

      if (!name) {
        throw new context.sls.classes.Error('Missing `name` parameter', 'DASHBOARD_MISSING_OUTPUT_NAME');
      }

      const value = yield _asyncToGenerator(function* () {
        try {
          return yield resolveOutput(name, resolveInput(context));
        } catch (error) {
          if (error.message.includes(' not found')) return null;
          throw error;
        }
      })();
      const slsCli = context.sls.cli;
      if (!value) slsCli.log(`No '${name}' output stored`);else process.stdout.write(`${stringifyValue(value)}\n`);
    });

    function get(_x) {
      return _get.apply(this, arguments);
    }

    return get;
  }(),
  list: function () {
    var _list = _asyncToGenerator(function* (context) {
      const outputs = yield resolveOutputs(resolveInput(context));
      const slsCli = context.sls.cli;

      if (isEmpty(outputs)) {
        slsCli.log('No outputs stored');
      } else {
        slsCli.log('Stored outputs:');
        process.stdout.write(`\n${cliTable([[chalk.bold('Name'), chalk.bold('Value')], ...entries(outputs).map(([name, value]) => [name, stringifyValue(value)])])}\n`);
      }
    });

    function list(_x2) {
      return _list.apply(this, arguments);
    }

    return list;
  }()
};
//# sourceMappingURL=outputCommand.js.map