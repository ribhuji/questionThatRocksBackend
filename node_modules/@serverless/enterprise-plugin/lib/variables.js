'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const resolveOutput = require('./resolveOutput');

const resolveParams = require('./resolveParams');

const throwAuthError = require('./throwAuthError'); // functions for new way of getting variables


const getValueFromDashboardParams = ctx => /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (variableString) {
    const variableName = variableString.slice(variableString.indexOf(':') + 1);
    ctx.state.secretsUsed.add(variableName);

    if (ctx.sls.processedInput.commands[0] === 'login' || ctx.sls.processedInput.commands[0] === 'logout' || ctx.sls.interactiveCli) {
      return '';
    }

    if (!ctx.sls.enterpriseEnabled) throwAuthError(ctx.sls);
    const secrets = yield resolveParams({
      org: ctx.sls.service.org,
      app: ctx.sls.service.app,
      stage: ctx.provider.getStage()
    });

    if (!secrets[variableName]) {
      throw new ctx.sls.classes.Error(`$\{${variableString}} not defined`);
    }

    return secrets[variableName];
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

const getValueFromDashboardOutputs = ctx => /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (variableString) {
    if (ctx.sls.processedInput.commands[0] === 'login' || ctx.sls.processedInput.commands[0] === 'logout' || ctx.sls.interactiveCli) {
      return '';
    }

    const variableParts = variableString.split(':').slice(1);
    let service;
    let key;
    let app = ctx.sls.service.app;
    let stage = ctx.provider.getStage();
    let region = ctx.provider.getRegion();

    if (variableParts.length === 1) {
      service = variableParts[0].split('.', 1)[0];
      key = variableParts[0].slice(service.length);
    } else if (variableParts.length === 4) {
      service = variableParts[3].split('.', 1)[0];
      key = variableParts[3].slice(service.length);

      if (variableParts[0]) {
        app = variableParts[0];
      }

      if (variableParts[1]) {
        stage = variableParts[1];
      }

      if (variableParts[2]) {
        region = variableParts[2];
      }
    } else {
      throw new ctx.sls.classes.Error('`${${variableString}}` does not conform to syntax ${outputs:service.key} or ${outputs:app:stage:region:service.key}');
    }

    const outputName = key.split('.')[1];
    const subkey = key.slice(outputName.length + 2);
    if (!ctx.sls.enterpriseEnabled) throwAuthError(ctx.sls);
    const value = resolveOutput(outputName, {
      service,
      app,
      org: ctx.sls.service.org,
      stage,
      region
    });

    if (subkey) {
      return _.get(value, subkey);
    }

    return value;
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = {
  getValueFromDashboardParams,
  getValueFromDashboardOutputs
};
//# sourceMappingURL=variables.js.map