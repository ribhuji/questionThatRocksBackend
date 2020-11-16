'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const path = require('path');

const _require = require('fs-extra'),
      readFile = _require.readFile,
      writeFile = _require.writeFile;

const getServerlessFilePath = require('../deployment/getServerlessFilePath');

const yamlExtensions = new Set(['.yml', '.yaml']);
const appPattern = /^(?:#\s*)?app\s*:.+/m;
const orgPattern = /^(?:#\s*)?(?:tenant|org)\s*:.+/m;

module.exports = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (serverless, orgName, appName) {
    const serverlessFileName = yield getServerlessFilePath(serverless.processedInput.options.config, serverless.config.servicePath);
    let ymlString = yield _asyncToGenerator(function* () {
      if (!yamlExtensions.has(path.extname(serverlessFileName))) return null; // Non YAML config

      try {
        return yield readFile(serverlessFileName);
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    })();

    if (!ymlString) {
      process.stdout.write('Add the following settings to your serverless configuration file:\n\n' + `org: ${orgName}\napp: ${appName}\n`);
      return;
    }

    ymlString = ymlString.toString();
    const appMatch = ymlString.match(appPattern);

    if (appMatch) {
      ymlString = ymlString.replace(appMatch[0], `app: ${appName}`);
    } else {
      ymlString = `app: ${appName}\n${ymlString}`;
    }

    const orgMatch = ymlString.match(orgPattern);

    if (orgMatch) {
      ymlString = ymlString.replace(orgMatch[0], `org: ${orgName}`);
    } else {
      ymlString = `org: ${orgName}\n${ymlString}`;
    }

    yield writeFile(serverlessFileName, ymlString);
    serverless.service.org = orgName;
    serverless.service.app = appName;
    serverless.enterpriseEnabled = true;
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=writeOrgAndApp.js.map