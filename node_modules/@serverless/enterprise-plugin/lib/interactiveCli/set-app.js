'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const chalk = require('chalk');

const _require = require('@serverless/platform-sdk'),
      createApp = _require.createApp,
      createDeployProfile = _require.createDeployProfile,
      getApps = _require.getApps,
      getDeployProfiles = _require.getDeployProfiles,
      getLoggedInUser = _require.getLoggedInUser,
      getMetadata = _require.getMetadata,
      listTenants = _require.listTenants,
      refreshToken = _require.refreshToken,
      setDefaultDeploymentProfile = _require.setDefaultDeploymentProfile;

const enableConfirm = require('./enableConfirm');

const writeOrgAndApp = require('./writeOrgAndApp');

const _require2 = require('./utils'),
      resolveAccessKey = _require2.resolveAccessKey;

const isValidAppName = RegExp.prototype.test.bind(/^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/);

const orgUpdateConfirm = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (inquirer) {
    process.stdout.write("Service has monitoring setup, but provided configuration doesn't seem to correspond" + " to account you're logged in with.\n\n");
    return (yield inquirer.prompt({
      message: 'Would you like to update it?',
      type: 'confirm',
      name: 'shouldUpdateOrg'
    })).shouldUpdateOrg;
  });

  return function orgUpdateConfirm(_x) {
    return _ref.apply(this, arguments);
  };
}();

const appUpdateConfirm = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (inquirer, appName, orgName) {
    process.stdout.write("Service seems to have monitoring enabled, but configured app doesn't seem to exist in an organization.\n\n");
    return (yield inquirer.prompt({
      message: 'What would you like to do?',
      type: 'list',
      name: 'appUpdateType',
      choices: [{
        name: `Create '${appName}' app in '${orgName}' org`,
        value: 'create'
      }, {
        name: 'Switch to one of the existing apps (or create new one with different name)',
        value: 'chooseExisting'
      }, {
        name: "Skip, I'll sort this out manually",
        value: 'skip'
      }]
    })).appUpdateType;
  });

  return function appUpdateConfirm(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

const orgsChoice = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (inquirer, orgNames) {
    return (yield inquirer.prompt({
      message: 'What org do you want to add this to?',
      type: 'list',
      name: 'orgName',
      choices: Array.from(orgNames)
    })).orgName;
  });

  return function orgsChoice(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

const deployProfileChoice = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (inquirer, deployProfiles) {
    return (yield inquirer.prompt({
      message: 'What deployment profile do you want to use?',
      type: 'list',
      name: 'deploymentProfile',
      choices: Array.from(deployProfiles)
    })).deploymentProfile;
  });

  return function deployProfileChoice(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

const appNameChoice = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (inquirer, appNames) {
    return (yield inquirer.prompt({
      message: 'What application do you want to add this to?',
      type: 'list',
      name: 'appName',
      choices: Array.from(appNames).concat({
        name: '[create a new app]',
        value: '_create_'
      })
    })).appName;
  });

  return function appNameChoice(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

const appNameInput = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (inquirer, appNames) {
    return (yield inquirer.prompt({
      message: 'What do you want to name this application?',
      type: 'input',
      name: 'newAppName',
      validate: input => {
        input = input.trim();

        if (!isValidAppName(input)) {
          return 'App name is not valid.\n' + '   - It should only contain lowercase alphanumeric and hyphens.\n' + '   - It should start and end with an alphanumeric character.\n' + "   - Shouldn't exceed 128 characters";
        }

        if (appNames.includes(input)) return 'App of this name already exists';
        return true;
      }
    })).newAppName.trim();
  });

  return function appNameInput(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

const createAppWithDeploymentProfile = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(function* (inquirer, orgName, accessKey, newAppName) {
    const _yield$createApp = yield createApp({
      tenant: orgName,
      app: newAppName,
      token: accessKey
    }),
          appName = _yield$createApp.appName;

    let deployProfiles = yield getDeployProfiles({
      tenant: orgName,
      accessKey
    });
    let deploymentProfile;

    if (deployProfiles.length === 0) {
      yield createDeployProfile({
        name: 'default',
        tenant: orgName,
        accessKey
      });
      deployProfiles = yield getDeployProfiles({
        tenant: orgName
      });
    }

    if (deployProfiles.length === 1) {
      deploymentProfile = deployProfiles[0].deploymentProfileUid;
    } else {
      deploymentProfile = yield deployProfileChoice(inquirer, deployProfiles.map(({
        name
      }) => name));
      deploymentProfile = _.find(deployProfiles, ({
        name
      }) => name === deploymentProfile).deploymentProfileUid;
    }

    yield setDefaultDeploymentProfile({
      accessKey,
      app: appName,
      tenant: orgName,
      deploymentProfile
    });
    return appName;
  });

  return function createAppWithDeploymentProfile(_x13, _x14, _x15, _x16) {
    return _ref7.apply(this, arguments);
  };
}();

const steps = {
  enableConfirm,
  resolveOrgNames: function () {
    var _resolveOrgNames = _asyncToGenerator(function* (user) {
      let orgs = new Set();

      if (!user.idToken) {
        // User registered over CLI hence idToken is not stored.
        // Still to resolve organizations from platform idToken is needed.
        // Handling it gently by assuming that orgs listed in config file
        // make a valid representation
        for (var _i = 0, _Object$keys = Object.keys(user.accessKeys); _i < _Object$keys.length; _i++) {
          const org = _Object$keys[_i];
          orgs.add(org);
        }
      } else {
        yield refreshToken();
        user = getLoggedInUser();
        orgs = new Set((yield listTenants({
          username: user.username,
          idToken: user.idToken
        })).map(org => org.tenantName));
      }

      return orgs;
    });

    function resolveOrgNames(_x17) {
      return _resolveOrgNames.apply(this, arguments);
    }

    return resolveOrgNames;
  }(),
  setOrgAndApp: function () {
    var _setOrgAndApp = _asyncToGenerator(function* (serverless, {
      user,
      orgNames,
      orgName,
      apps,
      appName,
      newAppName
    }) {
      const inquirer = serverless.interactiveCli.inquirer;

      if (!orgName) {
        orgName = yield _asyncToGenerator(function* () {
          if (orgNames.size === 1) return orgNames.values().next().value;
          return orgsChoice(inquirer, orgNames);
        })();
      }

      const accessKey = yield resolveAccessKey(user, orgName);

      if (!newAppName && !appName) {
        if (!apps) apps = yield getApps({
          tenant: orgName,
          token: accessKey
        });
        const appNames = apps.map(app => app.appName);
        appName = apps.length ? yield appNameChoice(inquirer, appNames) : '_create_';
        if (appName === '_create_') newAppName = yield appNameInput(inquirer, appNames);
      }

      if (newAppName) {
        appName = yield createAppWithDeploymentProfile(inquirer, orgName, accessKey, newAppName);
      }

      if (serverless.service.isDashboardMonitoringOverridenByCli && serverless.service.isDashboardAppPreconfigured) {
        const _yield$inquirer$promp = yield inquirer.prompt({
          message: 'Are you sure you want to update monitoring settings ' + `to ${chalk.bold(`app: ${appName}, org: ${orgName}`)}`,
          type: 'confirm',
          name: 'shouldOverrideDashboardConfig'
        }),
              shouldOverrideDashboardConfig = _yield$inquirer$promp.shouldOverrideDashboardConfig;

        if (!shouldOverrideDashboardConfig) {
          delete serverless.service.app;
          delete serverless.service.org;
          return;
        }
      }

      yield writeOrgAndApp(serverless, orgName, appName);
      return;
    });

    function setOrgAndApp(_x18, _x19) {
      return _setOrgAndApp.apply(this, arguments);
    }

    return setOrgAndApp;
  }()
};
module.exports = {
  check(serverless) {
    return _asyncToGenerator(function* () {
      if (!serverless.config.servicePath) return false;
      if (serverless.service.provider.name !== 'aws') return false;

      const _yield$getMetadata = yield getMetadata(),
            supportedRegions = _yield$getMetadata.supportedRegions,
            supportedRuntimes = _yield$getMetadata.supportedRuntimes;

      if (!supportedRuntimes.includes(serverless.service.provider.runtime || 'nodejs12.x')) {
        return false;
      }

      if (!supportedRegions.includes(serverless.getProvider('aws').getRegion())) return false;
      let user = getLoggedInUser();
      if (!user) return false;
      const orgNames = yield steps.resolveOrgNames(user);
      if (!orgNames.size) return false;
      user = getLoggedInUser(); // Refreshed, as new token might have been generated

      const orgName = serverless.service.org;
      const appName = serverless.service.app;

      if (orgName && orgNames.has(orgName)) {
        const accessKey = yield resolveAccessKey(user, orgName);
        if (!isValidAppName(appName)) return {
          user,
          orgName
        };
        const apps = yield getApps({
          tenant: orgName,
          token: accessKey
        });

        if (serverless.processedInput.options.org || serverless.processedInput.options.app) {
          if (apps.some(app => app.appName === appName)) {
            if (serverless.service.isDashboardMonitoringPreconfigured && serverless.service.isDashboardAppPreconfigured && !serverless.service.isDashboardMonitoringOverridenByCli) {
              return false;
            }

            return {
              user,
              orgName,
              appName
            };
          }

          if (serverless.processedInput.options.app) {
            process.stdout.write(chalk.red("\nPassed value for `--app` doesn't seem to correspond to chosen organization.\n"));
          }

          return {
            user,
            orgName
          };
        } else if (apps.some(app => app.appName === appName)) {
          return false;
        }

        return {
          user,
          orgName,
          apps,
          newAppName: appName
        };
      } else if (orgName) {
        if (serverless.processedInput.options.org) {
          process.stdout.write(chalk.red("\nPassed value for `--org` doesn't seem to correspond to account with which you're logged in with.\n"));
        } else {
          process.stdout.write(chalk.red(`\nConfigured org '${orgName}' is not available in your account.\n`));
        }
      }

      return {
        user,
        orgNames
      };
    })();
  },

  run(serverless, options) {
    return _asyncToGenerator(function* () {
      const inquirer = serverless.interactiveCli.inquirer;
      if (!options.orgName) delete serverless.service.org;
      if (!options.appName && !options.newAppName) delete serverless.service.app;

      if (!serverless.processedInput.options.org && !serverless.processedInput.options.app) {
        if (serverless.service.isDashboardMonitoringPreconfigured) {
          if (!options.orgName) {
            if (!(yield orgUpdateConfirm(inquirer))) return;
          } else if (options.newAppName) {
            const appUpdateTypeChoice = yield appUpdateConfirm(inquirer, options.newAppName, options.orgName);

            switch (appUpdateTypeChoice) {
              case 'create':
                break;

              case 'chooseExisting':
                delete options.newAppName;
                break;

              case 'skip':
                return;

              default:
                throw new Error('Unexpected app update type');
            }
          } else if (!(yield steps.enableConfirm(inquirer, serverless.processedInput.options))) {
            return;
          }
        } else if (!(yield steps.enableConfirm(inquirer, serverless.processedInput.options))) {
          return;
        }
      }

      yield steps.setOrgAndApp(serverless, options);
    })();
  },

  steps
};
//# sourceMappingURL=set-app.js.map