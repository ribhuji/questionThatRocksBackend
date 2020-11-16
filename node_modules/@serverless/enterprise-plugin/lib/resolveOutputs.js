'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      getService = _require.getService;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* ({
    org,
    app,
    service,
    stage,
    region
  }) {
    const serviceData = yield getService({
      accessKey: yield getAccessKeyForTenant(org),
      tenant: org,
      app,
      service
    });
    const stageData = serviceData.stagesAndRegions[stage];
    if (!stageData) return {};
    const regionData = stageData[region];
    if (!regionData) return {};
    return regionData.outputs;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=resolveOutputs.js.map