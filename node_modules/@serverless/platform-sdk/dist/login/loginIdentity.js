'use strict';

/*
 * Login (Identity)
 * - Initiates a login transaction with the login broker
 * - Returns an object with two promise properties
 * - `transactionId` is a promise which resolves with an ID to be used by the frontend when sending the login information
 * - `loginData` is a promise which resolves with an object containing at least `idToken`, and other propoerties supplied by the frontend (e.g. `refreshToken`)
 */

var WS = require('ws');
var platformConfig = require('../config');

var _require = require('../fetch'),
    getAgent = _require.getAgent;

module.exports = function loginIdentity() {
  var ws = new WS(`${platformConfig.loginBrokerUrl}broker`, undefined, {
    followRedirects: true,
    agent: getAgent()
  });

  var resolveTransactionId = void 0,
      rejectTransactionId = void 0;
  var transactionId = new Promise(function (resolve, reject) {
    resolveTransactionId = resolve;
    rejectTransactionId = reject;
  });

  var resolveLoginData = void 0,
      rejectLoginData = void 0;
  var loginData = new Promise(function (resolve, reject) {
    resolveLoginData = resolve;
    rejectLoginData = reject;
  });

  ws.on('message', function (msg) {
    try {
      var data = JSON.parse(msg);
      switch (data.event) {
        case 'ready':
          resolveTransactionId(data.transactionId);
          break;
        case 'fulfilled':
          delete data.event;
          resolveLoginData(data);
          ws.terminate();
          break;
        default:
          throw new Error('Encountered an unexpected message while waiting for login information. Your Serverless Framework or SDK may be out of date.');
      }
    } catch (error) {
      rejectTransactionId(error);
      rejectLoginData(error);
      ws.terminate();
    }
  });

  ws.on('open', function () {
    ws.send('{"action":"login"}');
  });

  return {
    transactionId,
    loginData
  };
};
//# sourceMappingURL=loginIdentity.js.map