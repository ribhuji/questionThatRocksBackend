'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const chalk = require('chalk');

const _ = require('lodash');

const _require = require('@serverless/platform-sdk'),
      configureFetchDefaults = _require.configureFetchDefaults,
      openBrowser = _require.openBrowser,
      getAccessKeyForTenant = _require.getAccessKeyForTenant,
      getMetadata = _require.getMetadata;

const errorHandler = require('./errorHandler');

const logsCollection = require('./logsCollection');

const login = require('./login');

const logout = require('./logout');

const wrap = require('./wrap');

const injectLogsIamRole = require('./injectLogsIamRole');

const injectOutputOutputs = require('./injectOutputOutputs');

const wrapClean = require('./wrapClean');

const runPolicies = require('./safeguards');

const getCredentials = require('./credentials');

const getAppUids = require('./appUids');

const removeDestination = require('./removeDestination');

const _require2 = require('./deployment'),
      saveDeployment = _require2.saveDeployment,
      createAndSetDeploymentUid = _require2.createAndSetDeploymentUid;

const variables = require('./variables');

const _require3 = require('./generateEvent'),
      generate = _require3.generate,
      eventDict = _require3.eventDict;

const _require4 = require('./deployProfile'),
      configureDeployProfile = _require4.configureDeployProfile;

const _require5 = require('./test'),
      test = _require5.test;

const _require6 = require('./dashboard'),
      getDashboardUrl = _require6.getDashboardUrl;

const setApiGatewayAccessLogFormat = require('./setApiGatewayAccessLogFormat');

const interactiveCli = require('./interactiveCli');

const paramCommand = require('./paramCommand');

const outputCommand = require('./outputCommand');

const isAuthenticated = require('./isAuthenticated');

const throwAuthError = require('./throwAuthError');

const userNodeVersion = Number(process.version.split('.')[0].slice(1));
const unconditionalCommands = new Set(['dashboard', 'generate-event', 'help', 'login', 'logout', 'plugin']);
/*
 * Serverless Enterprise Plugin
 */

class ServerlessEnterprisePlugin {
  constructor(sls) {
    this.sls = sls; // Defaults

    this.state = {}; // Useful for storing data across hooks

    this.state.secretsUsed = new Set(); // Backward compatibility with `tenant`

    sls.service.org = sls.service.org || sls.service.tenant;
    delete sls.service.tenant;

    if (sls.configSchemaHandler && sls.service.provider.name === 'aws') {
      // Source:
      // https://github.com/serverless/enterprise-dashboard/blob/6c3a0fa28bff97a80d5f3f88a907fa887f734151/backend/src/utils/formats.js#L44-L48
      sls.configSchemaHandler.defineTopLevelProperty('org', {
        type: 'string',
        pattern: '^[a-z0-9]{5,39}$'
      }); // Source:
      // https://github.com/serverless/enterprise-dashboard/blob/6c3a0fa28bff97a80d5f3f88a907fa887f734151/backend/src/utils/formats.js#L50-L56

      sls.configSchemaHandler.defineTopLevelProperty('app', {
        type: 'string',
        pattern: '^[a-z0-9][a-z0-9-]{1,37}[a-z0-9]$'
      });
      sls.configSchemaHandler.defineTopLevelProperty('outputs', {
        type: 'object',
        patternProperties: {
          '^[a-zA-Z0-9]+$': {
            oneOf: [{
              type: 'string'
            }, {
              type: 'number'
            }, {
              type: 'boolean'
            }, {
              type: 'array'
            }, {
              type: 'object'
            }]
          }
        },
        additionalProperties: false
      });
      sls.configSchemaHandler.defineCustomProperties({
        properties: {
          enterprise: {
            type: 'object',
            properties: {
              collectApiGatewayLogs: {
                type: 'boolean'
              },
              collectLambdaLogs: {
                type: 'boolean'
              },
              compressLogs: {
                type: 'boolean'
              },
              disableAwsSpans: {
                type: 'boolean'
              },
              disableFrameworkInstrumentation: {
                type: 'boolean'
              },
              disableHttpSpans: {
                type: 'boolean'
              },
              logAccessIamRole: {
                $ref: _.get(this.sls.configSchemaHandler.schema.definitions, 'awsArnString') ? '#/definitions/awsArnString' : '#/definitions/awsArn'
              },
              logIngestMode: {
                enum: ['push', 'pull']
              }
            },
            additionalProperties: false
          },
          safeguards: {
            anyOf: [{
              type: 'object',
              properties: {
                isDisabled: {
                  type: 'boolean'
                }
              },
              additionalProperties: false
            }, {
              type: 'object',
              properties: {
                location: {
                  type: 'string'
                },
                policies: {
                  type: 'array',
                  items: {
                    oneOf: [{
                      type: 'string'
                    }, {
                      type: 'object',
                      additionalProperties: {
                        type: 'object'
                      },
                      maxProperties: 1
                    }]
                  }
                }
              },
              additionalProperties: false
            }]
          }
        }
      });
    }

    const _this$sls = this.sls,
          service = _this$sls.service,
          cliOptions = _this$sls.processedInput.options;
    service.isDashboardMonitoringPreconfigured = Boolean(service.org);

    if (service.isDashboardMonitoringPreconfigured) {
      service.isDashboardAppPreconfigured = Boolean(service.app);
      service.isDashboardMonitoringOverridenByCli = cliOptions.org && cliOptions.org !== service.org || cliOptions.app && cliOptions.app !== service.app;
    }

    if (cliOptions.org) service.org = cliOptions.org;
    if (cliOptions.app) service.app = cliOptions.app;
    configureFetchDefaults(); // Configure commands available to logged out users

    this.commands = {
      'login': {
        usage: 'Login or sign up for Serverless',
        lifecycleEvents: ['login'],
        enterprise: true
      },
      'logout': {
        usage: 'Logout from Serverless',
        lifecycleEvents: ['logout'],
        enterprise: true
      },
      'generate-event': {
        usage: 'Generate event',
        lifecycleEvents: ['generate-event'],
        options: {
          type: {
            usage: `Specify event type. ${_.keys(eventDict).join(', ')} are supported.`,
            shortcut: 't',
            required: true
          },
          body: {
            usage: 'Specify the body for the message, request, or stream event.',
            shortcut: 'b'
          }
        },
        enterprise: true
      },
      'test': {
        usage: 'Run HTTP tests',
        lifecycleEvents: ['test'],
        options: {
          function: {
            usage: 'Specify the function to test',
            shortcut: 'f'
          },
          test: {
            usage: 'Specify a specific test to run',
            shortcut: 't'
          }
        },
        enterprise: true
      },
      'dashboard': {
        usage: 'Open the Serverless dashboard',
        lifecycleEvents: ['dashboard'],
        enterprise: true
      },
      'output': {
        usage: '',
        commands: {
          get: {
            usage: 'Get value of dashboard deployment profile parameter',
            lifecycleEvents: ['get'],
            options: {
              name: {
                usage: 'Ouptut name'
              },
              org: {
                usage: 'Dashboard org'
              },
              app: {
                usage: 'Dashboard app'
              },
              service: {
                usage: 'Dashboard service'
              },
              stage: {
                usage: 'Dashboard stage'
              },
              region: {
                usage: 'Region'
              }
            }
          },
          list: {
            usage: 'List all dashboard deployment profile parameters',
            lifecycleEvents: ['list'],
            options: {
              org: {
                usage: 'Dashboard org'
              },
              app: {
                usage: 'Dashboard app'
              },
              service: {
                usage: 'Dashboard service'
              },
              stage: {
                usage: 'Dashboard stage'
              },
              region: {
                usage: 'Region'
              }
            }
          }
        }
      },
      'param': {
        usage: '',
        commands: {
          get: {
            usage: 'Get value of dashboard service output',
            lifecycleEvents: ['get'],
            options: {
              org: {
                usage: 'Dashboard org'
              },
              app: {
                usage: 'Dashboard app'
              },
              stage: {
                usage: 'Dashboard stage'
              }
            }
          },
          list: {
            usage: 'List all dashboard service outputs',
            lifecycleEvents: ['list'],
            options: {
              org: {
                usage: 'Dashboard org'
              },
              app: {
                usage: 'Dashboard app'
              },
              stage: {
                usage: 'Dashboard stage'
              }
            }
          }
        }
      },
      'studio': {
        usage: 'Develop a Serverless application in the cloud.',
        lifecycleEvents: ['studio'],
        options: {
          stage: {
            usage: 'Stage to use for development.',
            shortcut: 's'
          },
          region: {
            usage: 'Region to use for development.',
            shortcut: 'r'
          },
          autoStage: {
            usage: 'If specified, generate a random stage. This stage will be removed on exit.',
            shortcut: 'a'
          }
        },
        enterprise: true,
        configDependent: true
      },
      // TODO: Remove 'dev' with next major
      'dev': {
        lifecycleEvents: ['dev'],
        isHidden: true
      }
    };
    this.hooks = {
      'login:login': this.route('login:login').bind(this),
      'logout:logout': this.route('logout:logout').bind(this),
      'generate-event:generate-event': this.route('generate-event:generate-event').bind(this),
      'test:test': this.route('test:test').bind(this),
      'dashboard:dashboard': this.route('dashboard:dashboard').bind(this),
      'output:get:get': this.route('output:get:get').bind(this),
      'output:list:list': this.route('output:list:list').bind(this),
      'param:get:get': this.route('param:get:get').bind(this),
      'param:list:list': this.route('param:list:list').bind(this),
      // behavior is conditional on this.sls.enterpriseEnabled
      'after:aws:deploy:finalize:cleanup': this.route('after:aws:deploy:finalize:cleanup').bind(this),
      'studio:studio': this.route('studio:studio').bind(this),
      'dev:dev': this.route('dev:dev').bind(this)
    };
    this.variableResolvers = {
      param: {
        resolver: variables.getValueFromDashboardParams(this),
        serviceName: 'Serverless Parameters',
        isDisabledAtPrepopulation: true
      },
      secrets: {
        resolver: variables.getValueFromDashboardParams(this),
        serviceName: 'Serverless Secrets',
        isDisabledAtPrepopulation: true
      },
      output: {
        resolver: variables.getValueFromDashboardOutputs(this),
        serviceName: 'Serverless Outputs',
        isDisabledAtPrepopulation: true
      },
      state: {
        resolver: variables.getValueFromDashboardOutputs(this),
        serviceName: 'Serverless Outputs',
        isDisabledAtPrepopulation: true
      }
    }; // set allowed plugin options

    var _iterator = _createForOfIteratorHelper(sls.pluginManager.plugins),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const plugin = _step.value;

        if (plugin.constructor.name === 'InteractiveCli' && plugin.commands) {
          if (!plugin.commands.interactiveCli.options) {
            plugin.commands.interactiveCli.options = {};
          }

          plugin.commands.interactiveCli.options.app = {
            usage: 'Dashboard app'
          };
          plugin.commands.interactiveCli.options.org = {
            usage: 'Dashboard org'
          };
        } else if (plugin.commands) {
          var _iterator3 = _createForOfIteratorHelper(_.values(plugin.commands)),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              const command = _step3.value;

              if (command.configDependent) {
                command.options.app = {
                  usage: 'Dashboard app'
                };
                command.options.org = {
                  usage: 'Dashboard org'
                };
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } // Also adding in commands object of plugin man bc generating help doesn't reread the plugin
      // itself

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var _iterator2 = _createForOfIteratorHelper(_.values(sls.pluginManager.commands)),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        const command = _step2.value;

        if (command.configDependent) {
          command.options.app = {
            usage: 'Dashboard app'
          };
          command.options.org = {
            usage: 'Dashboard org'
          };
        }
      } // Add interactive CLI hooks

    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    Object.assign(this.hooks, interactiveCli(this)); // Check if dashboard is configured

    const missing = [];

    if (!sls.service.org) {
      missing.push('org');
    }

    if (!sls.service.app) {
      missing.push('app');
    }

    if (!sls.service.service) {
      missing.push('service');
    }

    if (missing.length > 0) {
      this.sfeEnabledHooks = {};
    } else {
      if (sls.service.app.match(new RegExp(sls.service.provider.variableSyntax)) || sls.service.org.match(new RegExp(sls.service.provider.variableSyntax))) {
        throw new this.sls.classes.Error('"app" and "org" in your serverless config can not use the variable system');
      }

      this.sfeEnabledHooks = {
        'before:package:createDeploymentArtifacts': this.route('before:package:createDeploymentArtifacts').bind(this),
        'after:package:createDeploymentArtifacts': this.route('after:package:createDeploymentArtifacts').bind(this),
        'before:deploy:function:packageFunction': this.route('before:deploy:function:packageFunction').bind(this),
        'after:deploy:function:packageFunction': this.route('after:deploy:function:packageFunction').bind(this),
        'before:invoke:local:invoke': this.route('before:invoke:local:invoke').bind(this),
        'before:aws:package:finalize:saveServiceState': this.route('before:aws:package:finalize:saveServiceState').bind(this),
        'before:deploy:deploy': this.route('before:deploy:deploy').bind(this),
        'before:aws:deploy:deploy:createStack': this.route('before:aws:deploy:deploy:createStack').bind(this),
        'after:deploy:finalize': this.route('after:deploy:finalize').bind(this),
        'after:deploy:deploy': this.route('after:deploy:deploy').bind(this),
        'before:info:info': this.route('before:info:info').bind(this),
        'after:info:info': this.route('after:info:info').bind(this),
        'before:logs:logs': this.route('before:logs:logs').bind(this),
        'before:metrics:metrics': this.route('before:metrics:metrics').bind(this),
        'before:remove:remove': this.route('before:remove:remove').bind(this),
        'after:remove:remove': this.route('after:remove:remove').bind(this),
        'after:invoke:local:invoke': this.route('after:invoke:local:invoke').bind(this),
        'before:offline:start:init': this.route('before:offline:start:init').bind(this),
        'before:step-functions-offline:start': this.route('before:step-functions-offline:start').bind(this)
      }; // Set Plugin hooks for authenticated Enteprise Plugin features

      Object.assign(this.hooks, this.sfeEnabledHooks);
    }
  }
  /*
   * Route
   */


  route(hook) {
    var _this = this;

    return /*#__PURE__*/_asyncToGenerator(function* () {
      // throw an error if SFE is disabled and running an SFE only hook
      if (!_this.sls.enterpriseEnabled && _.keys(_this.sfeEnabledHooks).includes(hook)) {
        throwAuthError(_this.sls);
      }

      switch (hook) {
        case 'before:package:createDeploymentArtifacts':
          {
            const accessKey = yield getAccessKeyForTenant(_this.sls.service.org);

            const _yield$getMetadata = yield getMetadata(accessKey),
                  supportedRegions = _yield$getMetadata.supportedRegions;

            const region = _this.provider.getRegion();

            if (!supportedRegions.includes(region)) {
              throw new _this.sls.classes.Error(`"${region}" region is not supported by dashboard`, 'DASHBOARD_NOT_SUPPORTED_REGION');
            }

            Object.assign(_this.sls.service, yield getAppUids(_this.sls.service.org, _this.sls.service.app));
            createAndSetDeploymentUid(_this);
            yield wrap(_this);
            yield injectLogsIamRole(_this);
            yield injectOutputOutputs(_this);
            yield setApiGatewayAccessLogFormat(_this);
            break;
          }

        case 'after:package:createDeploymentArtifacts':
          yield wrapClean(_this);
          break;

        case 'before:deploy:function:packageFunction':
          createAndSetDeploymentUid(_this);
          yield wrap(_this);
          break;

        case 'after:deploy:function:packageFunction':
          yield wrapClean(_this);
          break;

        case 'before:aws:package:finalize:saveServiceState':
          yield getCredentials(_this);
          yield logsCollection(_this);
          break;

        case 'before:deploy:deploy':
          _this.enterprise = {
            errorHandler: errorHandler(_this) // V.1 calls this when it crashes

          };
          yield runPolicies(_this);
          break;

        case 'before:aws:deploy:deploy:createStack':
          break;

        case 'after:aws:deploy:finalize:cleanup':
          if (_this.sls.enterpriseEnabled) {
            yield saveDeployment(_this);
          }

          break;

        case 'before:info:info':
          yield getCredentials(_this);
          break;

        case 'after:info:info':
          // eslint-disable-next-line no-console
          console.log(chalk.yellow(`Run "serverless dashboard" to open the dashboard or visit ${getDashboardUrl(_this)}`));
          break;

        case 'dashboard:dashboard':
          openBrowser(getDashboardUrl(_this));
          break;

        case 'before:logs:logs':
          yield getCredentials(_this);
          break;

        case 'before:metrics:metrics':
          yield getCredentials(_this);
          break;

        case 'before:remove:remove':
          yield getCredentials(_this);
          break;

        case 'after:remove:remove':
          Object.assign(_this.sls.service, yield getAppUids(_this.sls.service.org, _this.sls.service.app));
          yield removeDestination(_this);
          yield saveDeployment(_this, true);
          break;

        case 'before:invoke:local:invoke':
          Object.assign(_this.sls.service, {
            appUid: '000000000000000000',
            orgUid: '000000000000000000'
          });
          yield wrap(_this);
          break;

        case 'after:invoke:local:invoke':
          yield wrapClean(_this);
          break;

        case 'before:offline:start:init':
          // await wrap(this)
          break;

        case 'before:step-functions-offline:start':
          // await wrap(this)
          break;

        case 'login:login':
          yield login(_this);
          break;

        case 'logout:logout':
          yield logout(_this);
          break;

        case 'studio:studio':
          if (userNodeVersion >= 8) {
            const studio = require('./studio');

            yield studio(_this);
          } else {
            _this.sls.cli.log('Node 8 or higher is required to run Serverless Studio.');
          }

          break;

        case 'dev:dev':
          _this.sls.cli.log('The command "dev" has been renamed to "studio".');

          if (_this.sls.logDeprecation) {
            _this.sls.logDeprecation('DASHBOARD_DEV_COMMAND', '"dev" command will be removed with next major release');
          }

          break;

        case 'generate-event:generate-event':
          yield generate(_this);
          break;

        case 'test:test':
          yield test(_this);
          break;

        case 'param:get:get':
          yield paramCommand.get(_this);
          break;

        case 'param:list:list':
          yield paramCommand.list(_this);
          break;

        case 'output:get:get':
          yield outputCommand.get(_this);
          break;

        case 'output:list:list':
          yield outputCommand.list(_this);
          break;

        default:
      }
    });
  }

  asyncInit() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.sls.processedInput.options['help-interactive'] || _this2.sls.processedInput.options.help) {
        return;
      }

      if (_this2.sls.interactiveCli && _this2.sls.interactiveCli.initializeServiceConfiguration) {
        // Filter available projects to create if there's an intention to configure dashboard
        if (_this2.sls.processedInput.options.org || _this2.sls.processedInput.options.app) {
          _this2.sls.interactiveCli.initializeServiceConfiguration.initializeProjectChoices = _this2.sls.interactiveCli.initializeServiceConfiguration.initializeProjectChoices.filter(({
            value
          }) => ['aws-nodejs', 'aws-python3', 'aws-python'].includes(value));
        }
      }

      const missingConfigSettings = [];

      if (!_this2.sls.service.org) {
        missingConfigSettings.push('org');
      }

      if (!_this2.sls.service.app) {
        missingConfigSettings.push('app');
      }

      if (!_this2.sls.service.service) {
        missingConfigSettings.push('service');
      }

      const currentCommand = _this2.sls.processedInput.commands[0];

      if (missingConfigSettings.length === 0 && isAuthenticated() && !unconditionalCommands.has(currentCommand)) {
        _this2.sls.enterpriseEnabled = true;
      } // this.provider, intentionally not set in constructor, as then it affects plugin validation
      // in serverless, which will discard plugin when command not run in service context:
      // https://github.com/serverless/serverless/blob/f0ccf6441ace7b5cc524e774f025a39c3c0667f2/lib/classes/PluginManager.js#L78


      _this2.provider = _this2.sls.getProvider('aws');
      if (_this2.sls.enterpriseEnabled) yield configureDeployProfile(_this2);
    })();
  }

}

module.exports = ServerlessEnterprisePlugin;
//# sourceMappingURL=plugin.js.map