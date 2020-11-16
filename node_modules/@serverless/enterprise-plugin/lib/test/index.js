'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('lodash'),
      entries = _require.entries,
      find = _require.find;

const fse = require('fs-extra');

const chalk = require('chalk');

const yaml = require('js-yaml');

const runTest = require('./runTest');

module.exports.test = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    if (!ctx.sls.enterpriseEnabled) {
      ctx.sls.cli.log('Run "serverless" to configure your service for testing.');
      return;
    }

    if (!fse.exists('serverless.test.yml')) {
      ctx.sls.cli.log('No serverless.test.yml file found');
      return;
    }

    let tests = yaml.safeLoad(yield fse.readFile('serverless.test.yml'));
    const options = ctx.sls.processedInput.options;

    if (options.function) {
      tests = tests.filter(({
        endpoint
      }) => endpoint.function === options.function);
    }

    if (options.test) {
      tests = tests.filter(({
        name
      }) => name === options.test);
    }

    const cfnStack = yield ctx.provider.request('CloudFormation', 'describeStacks', {
      StackName: ctx.provider.naming.getStackName()
    });
    const apigResource = find(cfnStack.Stacks[0].Outputs, ({
      OutputKey
    }) => !OutputKey.endsWith('Websocket') && OutputKey.match(ctx.provider.naming.getServiceEndpointRegex()));
    const baseApiUrl = apigResource.OutputValue;
    ctx.sls.cli.log(`Test Results:

   Summary --------------------------------------------------
`);
    const errors = [];
    let numTests = 0;
    const funcs = ctx.sls.service.functions || {};

    var _iterator = _createForOfIteratorHelper(tests || []),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const testSpec = _step.value;
        let method = testSpec.endpoint.method;

        if (!method) {
          if (typeof funcs[testSpec.endpoint.function].events[0].http === 'string') {
            method = funcs[testSpec.endpoint.function].events[0].http.split(' ')[0];
          } else {
            method = funcs[testSpec.endpoint.function].events[0].http.method;
          }
        }

        let path = testSpec.endpoint.path;

        if (!path) {
          if (typeof funcs[testSpec.endpoint.function].events[0].http === 'string') {
            path = funcs[testSpec.endpoint.function].events[0].http.split(' ')[1];
          } else {
            path = funcs[testSpec.endpoint.function].events[0].http.path;
          }
        }

        const testName = `${method.toUpperCase()} ${path} - ${testSpec.name}`;

        try {
          numTests += 1;
          process.stdout.write(`  running - ${testName}`);
          yield runTest(testSpec, path, method, baseApiUrl);
          process.stdout.write(`\r   ${chalk.green('passed')} - ${testName}\n`);
        } catch (error) {
          errors.push({
            testSpec,
            error
          });
          process.stdout.write(`\r   ${chalk.red('failed')} - ${testName}\n`);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    process.stdout.write('\n');

    if (errors.length > 0) {
      process.stdout.write(`   ${chalk.yellow('Details --------------------------------------------------')}\n\n`);

      for (let i = 0; i < errors.length; i++) {
        const _errors$i = errors[i],
              error = _errors$i.error,
              testSpec = _errors$i.testSpec;
        const _error$resp = error.resp,
              headers = _error$resp.headers,
              status = _error$resp.status;
        process.stdout.write(`   ${i + 1}) ${chalk.red(`Failed -  ${testSpec.name}`)}\n`);
        /* eslint-disable no-underscore-dangle */

        const info = `      status: ${status}
      headers:
    ${entries(headers._headers).map(([key, value]) => `    ${key}: ${value}`).join('\n').replace(/\n/g, '\n    ')}
      body: ${error.body}`;
        /* eslint-enable */

        process.stdout.write(chalk.grey(info));
        const expectedAndReceived = `
      expected: ${error.field} = ${typeof error.expected === 'object' ? JSON.stringify(error.expected, null, 2).replace(/\n/g, '\n      ') : error.expected}
      received: ${error.field} = ${typeof error.received === 'object' ? JSON.stringify(error.received, null, 2).replace(/\n/g, '\n      ') : error.received}\n\n`;
        process.stdout.write(`\n${chalk.white(expectedAndReceived)}`);
      }
    }

    const passed = chalk.green(`${numTests - errors.length} passed`);
    const failed = chalk.red(`${errors.length} failed`);
    ctx.sls.cli.log(`Test Summary: ${passed}, ${failed}`);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=index.js.map