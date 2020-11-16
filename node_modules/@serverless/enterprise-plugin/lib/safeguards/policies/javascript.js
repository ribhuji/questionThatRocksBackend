'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const jsonataQuery = require('jsonata');

const vm = require('vm');

const execStatement = (service, statement) => {
  const jsonata = queryStatement => {
    const expression = jsonataQuery(queryStatement);
    const value = expression.evaluate(service);

    if (Array.isArray(value)) {
      return value.length > 0;
    } else if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }

    return Boolean(value);
  };

  const sandbox = _objectSpread({
    jsonata
  }, service);

  vm.createContext(sandbox);
  return vm.runInContext(statement, sandbox);
};

module.exports = function javascriptPolicy(policy, service, options) {
  const statement = JSON.parse(options);
  let response;

  try {
    response = execStatement(service, statement);
  } catch (ex) {
    policy.fail(`Error in the policy statement: "${statement}"`);
    return;
  }

  if (!response) {
    policy.fail('Must comply with all of the configured queries.');
    return;
  }

  policy.approve();
};

module.exports.docs = 'http://slss.io/sg-custom-policy';
//# sourceMappingURL=javascript.js.map