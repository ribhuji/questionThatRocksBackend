'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('@serverless/platform-sdk'),
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      getMetadata = _require.getMetadata;

const _require2 = require('lodash'),
      entries = _require2.entries,
      values = _require2.values;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.collectLambdaLogs === false) {
      return;
    }

    if (values(ctx.sls.service.provider.compiledCloudFormationTemplate.Resources).filter(({
      Type
    }) => Type === 'AWS::Logs::LogGroup').length === 0) {
      // no log groups
      return;
    }

    const accessKey = yield getAccessKeyForTenant(ctx.sls.service.org);

    if (ctx.sls.service.custom && ctx.sls.service.custom.enterprise && ctx.sls.service.custom.enterprise.logAccessIamRole) {
      return;
    }

    const _yield$getMetadata = yield getMetadata(accessKey),
          awsAccountId = _yield$getMetadata.awsAccountId;

    ctx.sls.service.provider.compiledCloudFormationTemplate.Resources.EnterpriseLogAccessIamRole = {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: {
              AWS: `arn:aws:iam::${awsAccountId}:root`
            },
            Action: 'sts:AssumeRole',
            Condition: {
              StringEquals: {
                'sts:ExternalId': `ServerlessEnterprise-${ctx.sls.service.orgUid}`
              }
            }
          }]
        },
        Policies: [{
          PolicyName: 'LogFilterAccess',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Action: ['logs:FilterLogEvents'],
              Resource: entries(ctx.sls.service.provider.compiledCloudFormationTemplate.Resources).filter(([, {
                Type
              }]) => Type === 'AWS::Logs::LogGroup').map(([logicalId]) => ({
                'Fn::GetAtt': [logicalId, 'Arn']
              }))
            }]
          }
        }]
      }
    };
    ctx.sls.service.provider.compiledCloudFormationTemplate.Outputs.EnterpriseLogAccessIamRole = {
      Value: {
        'Fn::GetAtt': ['EnterpriseLogAccessIamRole', 'Arn']
      }
    };
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=injectLogsIamRole.js.map