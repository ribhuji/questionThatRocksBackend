'use strict';

const _require = require('@serverless/platform-sdk'),
      urls = _require.urls;

module.exports.getDashboardUrl = ctx => {
  let dashboardUrl = urls.frontendUrl;

  if (ctx.sls.enterpriseEnabled) {
    dashboardUrl += `tenants/${ctx.sls.service.org}/`;
    dashboardUrl += `applications/${ctx.sls.service.app}/`;
    dashboardUrl += `services/${ctx.sls.service.service}/`;
    dashboardUrl += `stage/${ctx.provider.getStage()}/`;
    dashboardUrl += `region/${ctx.provider.getRegion()}`;
  }

  return dashboardUrl;
};
//# sourceMappingURL=dashboard.js.map