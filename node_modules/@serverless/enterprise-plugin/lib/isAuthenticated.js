'use strict';

const _require = require('@serverless/platform-sdk'),
      getLoggedInUser = _require.getLoggedInUser;

module.exports = () => Boolean(getLoggedInUser() || process.env.SERVERLESS_ACCESS_KEY);
//# sourceMappingURL=isAuthenticated.js.map