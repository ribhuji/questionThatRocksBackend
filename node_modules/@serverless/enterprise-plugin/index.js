'use strict';

require('./runtime');

const _require = require('@serverless/platform-sdk/package.json'),
      version = _require.version;

module.exports = require('./lib/plugin');
module.exports.sdkVersion = version;

//# sourceMappingURL=index.js.map