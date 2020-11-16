'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const chalk = require('chalk');

const _require = require('@serverless/platform-sdk'),
      createApp = _require.createApp,
      getLoggedInUser = _require.getLoggedInUser,
      getMetadata = _require.getMetadata,
      login = _require.login,
      sdkRegister = _require.register,
      writeConfigFile = _require.writeConfigFile;

const sdkVersion = require('@serverless/platform-sdk/package').version;

const enableConfirm = require('./enableConfirm');

const writeOrgAndApp = require('./writeOrgAndApp');

const isValidEmail = RegExp.prototype.test.bind(new RegExp("^(?:[a-z0-9!#$%&'*+/=?^_`{|}~\u007f-\uffff-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`" + '{|}~\\u007f-\\uffff-]+)*|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-' + '\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-z0-9](?:[a-' + 'z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]' + '|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9]' + '[0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-' + '\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$'));

const register = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (...args) {
    const result = yield sdkRegister(...args);
    result.orgName = result.tenantName;
    delete result.tenantName;
    return result;
  });

  return function register() {
    return _ref.apply(this, arguments);
  };
}();

const registerQuestion = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (inquirer) {
    return (yield inquirer.prompt({
      message: 'Do you want to login or register?',
      type: 'list',
      name: 'accessMode',
      choices: ['register', 'login']
    })).accessMode;
  });

  return function registerQuestion(_x) {
    return _ref2.apply(this, arguments);
  };
}();

const emailInput = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (inquirer) {
    return (yield inquirer.prompt({
      message: 'email:',
      type: 'input',
      name: 'dashboardEmail',
      validate: input => {
        input = input.trim().toLowerCase();
        if (isValidEmail(input)) return true;
        return 'Provided email address is not valid';
      }
    })).dashboardEmail.trim().toLowerCase();
  });

  return function emailInput(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

const passwordInput = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (inquirer) {
    return (yield inquirer.prompt({
      message: 'password:',
      type: 'password',
      name: 'dashboardPassword',
      validate: input => {
        if (input.trim().length >= 7) return true;
        return 'Password needs to have at least 7 characters';
      }
    })).dashboardPassword.trim();
  });

  return function passwordInput(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

const sdkSignUp = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (email, password, userName, orgName) {
    try {
      return yield register(email, password, userName, orgName, orgName);
    } catch (error) {
      const errorData = (() => {
        try {
          return JSON.parse(error.message);
        } catch (parseError) {
          throw error;
        }
      })();

      if (!errorData || !errorData.errorMessage) throw error;

      if (errorData.errorMessage.includes('this username already exists')) {
        const trailingNumberMatches = userName.match(/^(.*)(\d+)$/);

        if (trailingNumberMatches) {
          userName = trailingNumberMatches[1] + (Number(trailingNumberMatches[2]) + 1);
        } else {
          userName += '2';
        }

        return sdkSignUp(email, password, userName, orgName);
      }

      if (errorData.errorMessage.includes('tenant with this name already exists')) {
        const trailingNumberMatches = orgName.match(/^(.*)(\d+)$/);

        if (trailingNumberMatches) {
          orgName = trailingNumberMatches[1] + (Number(trailingNumberMatches[2]) + 1);
        } else {
          orgName += '2';
        }

        return sdkSignUp(email, password, userName, orgName);
      }

      if (errorData.errorMessage.includes('"tenantName" length must be at least')) {
        orgName += 'x';
        return sdkSignUp(email, password, userName, orgName);
      }

      error.sdkMessage = errorData.errorMessage;
      throw error;
    }
  });

  return function sdkSignUp(_x4, _x5, _x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

const generateUserName = email => {
  let userName = email.slice(0, email.indexOf('@')).replace(/[^a-z0-9]+/g, '');

  if (userName.length === 0) {
    userName = email.slice(1 + email.indexOf('@')).replace(/[^a-z0-9]+/g, '');
  }

  userName += 'x'.repeat(Math.max(5 - userName.length, 0));
  return userName;
};

const keepValidOrgNameChars = name => name.replace(/[^a-zA-Z0-9]/g, '');

const generateOrgName = email => {
  const userName = generateUserName(email);
  return keepValidOrgNameChars(userName);
};

const signUp = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (inquirer, email = null) {
    if (!email) email = yield emailInput(inquirer);
    const password = yield passwordInput(inquirer);
    const userName = generateUserName(email);
    const orgName = generateOrgName(email);

    try {
      return yield sdkSignUp(email, password, userName, orgName);
    } catch (error) {
      if (error.sdkMessage) {
        if (error.sdkMessage.includes('user already exists')) {
          // There's already account with given email registered
          process.stdout.write(chalk.red("There's already registered account for given email address. Please try different email address\n"));
          return signUp(inquirer);
        }

        if (error.sdkMessage.includes('PasswordStrengthError')) {
          process.stdout.write(chalk.red('Password is too weak. Please try different one\n'));
          return signUp(inquirer, email);
        }
      }

      throw error;
    }
  });

  return function signUp(_x8) {
    return _ref6.apply(this, arguments);
  };
}();

const validadateRegistrationResponseValue = (name, value) => {
  if (!value) throw new Error(`Missing ${name} in register response`);
};

const steps = {
  registerOrLogin: function () {
    var _registerOrLogin = _asyncToGenerator(function* (serverless) {
      const inquirer = serverless.interactiveCli.inquirer;
      const registerOrLogin = yield registerQuestion(inquirer);

      if (registerOrLogin === 'login') {
        yield login();
        return;
      }

      const _yield$signUp = yield signUp(inquirer),
            ownerUserName = _yield$signUp.ownerUserName,
            orgName = _yield$signUp.orgName,
            ownerAccessKey = _yield$signUp.ownerAccessKey,
            ownerAuth0Id = _yield$signUp.ownerAuth0Id;

      validadateRegistrationResponseValue('ownerUserName', ownerUserName);
      validadateRegistrationResponseValue('tenantName', orgName);
      validadateRegistrationResponseValue('ownerAccessKey', ownerAccessKey);
      validadateRegistrationResponseValue('ownerAuth0Id', ownerAuth0Id);
      writeConfigFile({
        userId: ownerAuth0Id,
        users: {
          [ownerAuth0Id]: {
            userId: ownerAuth0Id,
            userName: ownerUserName,
            enterprise: {
              versionSDK: sdkVersion,
              timeLastLogin: Math.round(Date.now() / 1000)
            },
            dashboard: {
              accessKeys: {
                [orgName]: ownerAccessKey
              },
              username: ownerUserName
            }
          }
        }
      });
      process.stdout.write(`\n${chalk.green('Successfully registered your new account')}\n`);

      const _yield$createApp = yield createApp({
        tenant: orgName,
        app: `${serverless.service.service}-app`,
        token: ownerAccessKey
      }),
            appName = _yield$createApp.appName;

      yield writeOrgAndApp(serverless, orgName, appName);
    });

    function registerOrLogin(_x9) {
      return _registerOrLogin.apply(this, arguments);
    }

    return registerOrLogin;
  }()
};
module.exports = {
  check(serverless) {
    return _asyncToGenerator(function* () {
      if (!serverless.config.servicePath) return false;

      if (serverless.service.provider.name !== 'aws') {
        return false;
      }

      const _yield$getMetadata = yield getMetadata(),
            supportedRegions = _yield$getMetadata.supportedRegions,
            supportedRuntimes = _yield$getMetadata.supportedRuntimes;

      if (!supportedRuntimes.includes(serverless.service.provider.runtime || 'nodejs10.x')) {
        return false;
      }

      if (!supportedRegions.includes(serverless.getProvider('aws').getRegion())) {
        return false;
      }

      return !getLoggedInUser();
    })();
  },

  run(serverless) {
    return _asyncToGenerator(function* () {
      const inquirer = serverless.interactiveCli.inquirer;

      if (!(yield enableConfirm(inquirer, serverless.processedInput.options))) {
        return null;
      }

      process.stdout.write('You are not logged in or you do not have a Serverless account.\n\n');
      return steps.registerOrLogin(serverless);
    })();
  },

  steps
};
//# sourceMappingURL=register.js.map