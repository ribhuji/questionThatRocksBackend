'use strict';

module.exports = function requiredStackTagsPolicy(policy, service, requiredStackTags) {
  let failed = false;
  const stackTags = service.declaration.provider.stackTags || {};

  for (var _i = 0, _Object$keys = Object.keys(requiredStackTags); _i < _Object$keys.length; _i++) {
    const key = _Object$keys[_i];

    if (!(key in stackTags)) {
      failed = true;
      policy.fail(`Required stack tag ${key} not set`);
    } else if (!stackTags[key].match(requiredStackTags[key])) {
      failed = true;
      policy.fail(`Required stack tag ${key} value ${stackTags[key]} does not match RegExp: ${requiredStackTags[key]}`);
    }
  }

  if (!failed) {
    policy.approve();
  }
};

module.exports.docs = 'http://slss.io/sg-required-stack-tags';
//# sourceMappingURL=required-stack-tags.js.map