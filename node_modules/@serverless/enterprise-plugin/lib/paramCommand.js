'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('lodash'),
      isEmpty = _require.isEmpty,
      entries = _require.entries;

const chalk = require('chalk');

const cliTable = require('cli-color/columns');

const isAuthenticated = require('./isAuthenticated');

const throwAuthError = require('./throwAuthError');

const resolveParams = require('./resolveParams');

const resolveInput = function resolveInput(ctx) {
  const provider = ctx.provider,
        _ctx$sls = ctx.sls,
        _ctx$sls$service = _ctx$sls.service,
        app = _ctx$sls$service.app,
        org = _ctx$sls$service.org,
        cliOptions = _ctx$sls.processedInput.options,
        ServerlessError = _ctx$sls.classes.Error;
  if (!isAuthenticated()) throwAuthError(ctx.sls);
  if (!org) throw new ServerlessError('Missing `org` setting', 'DASHBOARD_MISSING_ORG');
  if (!app) throw new ServerlessError('Missing `app` setting', 'DASHBOARD_MISSING_APP');
  const stage = cliOptions.stage || provider.getStage();
  return {
    org,
    app,
    stage
  };
};

module.exports = {
  get: function () {
    var _get = _asyncToGenerator(function* (context) {
      const params = yield resolveParams(resolveInput(context));
      const name = context.sls.processedInput.options.name;

      if (!name) {
        throw new context.sls.classes.Error('Missing `name` parameter', 'DASHBOARD_MISSING_PARAM_NAME');
      }

      const slsCli = context.sls.cli;
      if (!params[name]) slsCli.log(`No '${name}' parameter stored`);else process.stdout.write(`${params[name]}\n`);
    });

    function get(_x) {
      return _get.apply(this, arguments);
    }

    return get;
  }(),
  list: function () {
    var _list = _asyncToGenerator(function* (context) {
      const params = yield resolveParams(resolveInput(context));
      const slsCli = context.sls.cli;

      if (isEmpty(params)) {
        slsCli.log('No parameters stored');
      } else {
        slsCli.log('Stored parameters:');
        process.stdout.write(`\n${cliTable([[chalk.bold('Name'), chalk.bold('Value')], ...entries(params)])}\n`);
      }
    });

    function list(_x2) {
      return _list.apply(this, arguments);
    }

    return list;
  }()
};
//# sourceMappingURL=paramCommand.js.map