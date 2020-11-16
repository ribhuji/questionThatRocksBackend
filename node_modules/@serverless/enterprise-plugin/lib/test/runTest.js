'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('lodash'),
      entries = _require.entries;

const fetch = require('node-fetch');

const _require2 = require('./errors'),
      TestError = _require2.TestError;

const objectSubsetEquals = require('./objectSubsetEquals');

const runTest = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (testSpec, path, method, baseApiUrl) {
    let body;
    const headers = {};
    let queryString = '';

    if (testSpec.request && testSpec.request.body) {
      if (typeof testSpec.request.body === 'string') {
        body = testSpec.request.body; // eslint-disable-line prefer-destructuring
      } else {
        body = JSON.stringify(testSpec.request.body);
        headers['Content-Type'] = 'application/json';
      }
    }

    if (testSpec.request && testSpec.request.form) {
      queryString = entries(testSpec.request.form).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    }

    if (testSpec.request && testSpec.request.headers) {
      Object.assign(headers, testSpec.request.headers);
    }

    const resp = yield fetch(`${baseApiUrl}/${path}?${queryString}`, {
      method,
      body,
      headers
    });
    const respBody = yield resp.text();

    if (testSpec.response === true && !resp.ok) {
      throw new TestError('status', 200, resp.status, resp, respBody);
    } else if (testSpec.response) {
      if (testSpec.response.headers) {
        /* eslint-disable no-underscore-dangle */
        if (!objectSubsetEquals(testSpec.response.headers, resp.headers._headers)) {
          throw new TestError('headers', testSpec.response.headers, resp.headers._headers, resp, respBody);
        }
        /* eslint-enable */

      }

      if (testSpec.response.status && resp.status !== testSpec.response.status) {
        throw new TestError('status', testSpec.response.status, resp.status, resp, respBody);
      }

      if (testSpec.response.body) {
        if (typeof testSpec.response.body === 'string') {
          if (respBody !== testSpec.response.body) {
            throw new TestError('body', testSpec.response.body, respBody, resp, respBody);
          }
        } else {
          const json = JSON.parse(respBody);

          if (!objectSubsetEquals(testSpec.response.body, json)) {
            throw new TestError('body', testSpec.response.body, json, resp, respBody);
          }
        }
      }
    }
  });

  return function runTest(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = runTest;
//# sourceMappingURL=runTest.js.map