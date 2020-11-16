'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('fs-extra'),
      readdir = _require.readdir,
      readFile = _require.readFile;

const yml = require('yamljs');

const path = require('path');

const _require2 = require('lodash'),
      get = _require2.get,
      fromPairs = _require2.fromPairs,
      cloneDeep = _require2.cloneDeep,
      omit = _require2.omit;

const chalk = require('chalk'); // NOTE: not using path.join because it strips off the leading


const loadPolicy = (policyPath, safeguardName) => require(`${policyPath || './policies'}/${safeguardName}`);

function runPolicies(_x) {
  return _runPolicies.apply(this, arguments);
}

function _runPolicies() {
  _runPolicies = _asyncToGenerator(function* (ctx) {
    const basePath = ctx.sls.config.servicePath;
    if (get(ctx.sls.service, 'custom.safeguards.isDisabled')) return;

    if (Array.isArray(ctx.sls.service.plugins) && ctx.sls.service.plugins.includes('@serverless/safeguards-plugin')) {
      return;
    }

    if (ctx.sls.logDeprecation) {
      ctx.sls.logDeprecation('DASHBOARD_SAFEGUARDS', ['Safeguards support has been moved to the @serverless/safeguards-plugin external plugin and will be removed from the core with next major release.', '', 'Please visit https://github.com/serverless/safeguards-plugin/ to migrate your safeguards to the new plugin.', 'You may also disable safeguards by setting "custom.safeguards.isDisabled: true" in service config', ''].join('\n'));
    }

    const location = get(ctx.sls.service, 'custom.safeguards.location', '.');
    let localPoliciesPath = path.relative(__dirname, path.resolve(basePath, location));

    if (!localPoliciesPath.startsWith('.')) {
      localPoliciesPath = `.${path.sep}${localPoliciesPath}`;
    } // using || [] instead of _.get's default bc if it's falsey we want it to be []


    const localPolicies = get(ctx.sls.service, 'custom.safeguards.policies', []).map(policy => {
      let safeguardName = policy;
      let safeguardConfig = {};

      if (policy instanceof Object) {
        const policyObjKeys = Object.keys(policy);

        if (policyObjKeys.length !== 1) {
          throw new Error('Safeguards requires that each item in the policies list be either a string indicating a policy name, or else an object with a single key specifying the policy name with the policy options. One or more items were objects containing multiple keys. Correct these entries and try again.');
        }

        safeguardName = policyObjKeys[0];
        safeguardConfig = policy[safeguardName] || {};
      }

      return {
        safeguardName,
        safeguardConfig,
        policyPath: localPoliciesPath,
        enforcementLevel: 'error',
        title: `Local policy: ${safeguardName}`
      };
    });
    const policyConfigs = [...localPolicies, ...ctx.safeguards // fetched during initialize lifeCycle hook in deployment profile
    ];

    if (policyConfigs.length === 0) {
      return;
    }

    ctx.sls.cli.log('Safeguards Processing...');
    const policies = policyConfigs.map(policy => _objectSpread(_objectSpread({}, policy), {}, {
      function: loadPolicy(policy.policyPath, policy.safeguardName)
    }));
    const service = {
      compiled: {},
      declaration: cloneDeep(omit(ctx.sls.service, ['serverless'])),
      provider: ctx.provider,
      frameworkVersion: ctx.sls.version
    };
    const artifactsPath = path.join(basePath, '.serverless');
    const artifacts = yield readdir(artifactsPath);
    const jsonYamlArtifacts = yield Promise.all(artifacts.filter(filename => filename.match(/\.(json|yml|yaml)$/i)).map( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (filename) {
        const content = yield readFile(path.join(artifactsPath, filename));

        try {
          if (filename.match(/\.json$/i)) {
            return [filename, JSON.parse(content)];
          }

          return [filename, yml.parse(content)];
        } catch (error) {
          ctx.sls.cli.log(`(Safeguards) Failed to parse file ${filename} in the artifacts directory.`);
          throw error;
        }
      });

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    }()));
    ctx.sls.cli.log(`Safeguards Results:

   Summary --------------------------------------------------
`);
    service.compiled = fromPairs(jsonYamlArtifacts);
    const runningPolicies = policies.map( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (policy) {
        process.stdout.write(`  running - ${policy.title}`);
        const result = {
          approved: false,
          failed: false,
          policy
        };

        const approve = () => {
          result.approved = true;
          process.stdout.write(`\r   ${chalk.green('passed')} - ${policy.title}\n`);
        };

        const fail = message => {
          if (result.failed) {
            result.message += ` ${message}`;
          } else {
            const errorWord = policy.enforcementLevel === 'error' ? 'failed' : 'warned';
            const color = policy.enforcementLevel === 'error' ? chalk.red : chalk.keyword('orange');
            process.stdout.write(`\r   ${color(errorWord)} - ${policy.title}\n`);
            result.failed = true;
            result.message = message;
          }
        };

        const policyHandle = {
          approve,
          fail
        };
        yield policy.function(policyHandle, service, policy.safeguardConfig);

        if (!result.approved && !result.failed) {
          ctx.sls.cli.log(`Safeguard Policy "${policy.title}" finished running, but did not explicitly approve the deployment. This is likely a problem in the policy itself. If this problem persists, contact the policy author.`);
        }

        return result;
      });

      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    }());
    ctx.state.safeguardsResults = yield Promise.all(runningPolicies);
    const markedPolicies = ctx.state.safeguardsResults.filter(res => !res.approved && res.failed);
    const failed = markedPolicies.filter(res => res.policy.enforcementLevel === 'error').length;
    const warned = markedPolicies.filter(res => res.policy.enforcementLevel !== 'error').length;
    const passed = ctx.state.safeguardsResults.filter(res => res.approved && !res.failed).length;
    const summary = `Safeguards Summary: ${chalk.green(`${passed} passed`)}, ${chalk.keyword('orange')(`${warned} warnings`)}, ${chalk.red(`${failed} errors`)}`;

    if (markedPolicies.length !== 0) {
      const resolveMessage = res => {
        if (!res.failed) return 'Finished inconclusively. Deployment halted.';
        if (res.policy.enforcementLevel === 'error') return chalk.red(`Failed - ${res.message}`);
        return chalk.keyword('orange')(`Warned - ${res.message}`);
      };

      const details = `\n   ${chalk.yellow('Details --------------------------------------------------')}\n\n${markedPolicies.map((res, i) => `   ${i + 1}) ${resolveMessage(res)}
      ${chalk.grey(`details: ${res.policy.function.docs}`)}
      ${res.policy.description}`).join('\n\n\n')}`;
      process.stdout.write(`${details}\n\n`);

      if (!markedPolicies.every(res => res.approved || res.policy.enforcementLevel === 'warning')) {
        ctx.sls.cli.log(summary, '\nServerless');
        throw new Error('Deployment blocked by Serverless Safeguards');
      }
    }

    ctx.sls.cli.log(summary, '\nServerless');
  });
  return _runPolicies.apply(this, arguments);
}

module.exports = runPolicies;
module.exports.loadPolicy = loadPolicy;
//# sourceMappingURL=index.js.map