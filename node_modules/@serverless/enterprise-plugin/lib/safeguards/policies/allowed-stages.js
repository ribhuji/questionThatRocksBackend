'use strict';

module.exports = function allowedStagePolicy(policy, service, options) {
  const stageName = service.provider.getStage();

  if (typeof options === 'string') {
    if (!stageName.match(options)) {
      policy.fail(`Stage name "${stageName}" not permitted by RegExp: "${options}"`);
    } else {
      policy.approve();
    }
  } else {
    for (var _i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
      const i = _Object$keys[_i];

      if (options[i] === stageName) {
        policy.approve();
        return;
      }
    }

    policy.fail(`Stage name "${stageName}" not in list of permitted names: ${JSON.stringify(options)}`);
  }
};

module.exports.docs = 'http://slss.io/sg-allowed-stages';
//# sourceMappingURL=allowed-stages.js.map