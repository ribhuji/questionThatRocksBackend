'use strict';

module.exports = function allowedRuntimesPolicy(policy, service, allowedRuntimes) {
  let failed = false;

  for (var _i = 0, _Object$keys = Object.keys(service.declaration.functions); _i < _Object$keys.length; _i++) {
    const fnName = _Object$keys[_i];

    if (!allowedRuntimes.includes(service.declaration.functions[fnName].runtime || service.declaration.provider.runtime)) {
      failed = true;
      policy.fail(`Runtime of function ${fnName} not in list of permitted runtimes: ${JSON.stringify(allowedRuntimes)}`);
    }
  }

  if (!failed) {
    policy.approve();
  }
};

module.exports.docs = 'http://slss.io/sg-allowed-runtimes';
//# sourceMappingURL=allowed-runtimes.js.map