'use strict';

const WS = require('isomorphic-ws');
const querystring = require('querystring');
const jwtDecode = require('jwt-decode');
const util = require('util');
const domains = require('./domains');
const resources = require('./resources');
const Connection = require('./Connection');
const registry = require('./registry');
const instance = require('./instance');
const Eventer = require('./Eventer');
const webhooks = require('./webhooks');
const utils = require('./utils');

/**
 * The Serverless Platform SDK Class
 */
class ServerlessSDK {
  /**
   * Creates an instance of the SDK.  Accepts a configuration object and calls the `config()` method.  See the `config()` method for more information on allowed configuration.
   * @param {string} [config.accessKey] Can either be a Serverless Platform Access Key or an ID Token.
   * @param {string} [config.platformStage] The Serverless Platform Stage you wish to interact with.  This can also be set by the environment variable SERVERLESS_PLATFORM_STAGE=
   * @param {string} [context.orgName] The name of the Serverless Platform Organization you wish to interact with.  If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.
   * @param {string} [context.orgUid] The ID of the Serverless Platform Organization you wish to interact with.  If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.
   * @param {string} [context.stageName] The Serverless Platform Organization Stage you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.appName] The Serverless Platform Application you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.instanceName] The Serverless Platform Instance you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.componentName] The Serverless Platform Component you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.componentVersion] The Serverless Platform Component version you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @return {null}
   *
   * @example
   *
   *   const { ServerlessSDK } = require('@serverless/platform-client')
   *
   *   const sdk = new ServerlessSDK({
   *     accessKey: '123456789',
   *     context: {
   *       orgName: 'my-org',
   *       orgUid: '1234',
   *       stageName: 'prod',
   *       appName: 'my-app',
   *       instanceName: 'my-instance'
   *     }
   *   })
   * @return {null}
   */
  constructor(config = {}) {
    this.context = {};
    // Set config
    this.config(config);
    // Domains
    this.domains = domains[this.platformStage];
    // Other
    this.intercepts = {};
    this.intercepts.logs = [];
    this.intercepts.logsInterval = 200;
    this.eventer = new Eventer(this);
  }

  /**
   * Updates the SDK configuration
   * @method
   * @param {string} [config.accessKey] Can either be a Serverless Platform Access Key or an ID Token.
   * @param {string} [config.platformStage] The Serverless Platform Stage you wish to interact with.  This can also be set by the environment variable SERVERLESS_PLATFORM_STAGE=
   * @param {string} [context.orgName] The name of the Serverless Platform Organization you wish to interact with.  If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.
   * @param {string} [context.orgUid] The ID of the Serverless Platform Organization you wish to interact with.  If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.
   * @param {string} [context.stageName] The Serverless Platform Organization Stage you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.appName] The Serverless Platform Application you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.instanceName] The Serverless Platform Instance you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.componentName] The Serverless Platform Component you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @param {string} [context.componentVersion] The Serverless Platform Component version you wish to interact with.  If set, this value is auto-added to every Event you publish.
   * @return {null}
   *
   * @example
   *
   *   const { ServerlessSDK } = require('@serverless/platform-client')
   *
   *   const sdk = new ServerlessSDK()
   *   sdk.config({
   *     accessKey: '123456789',
   *     context: {
   *       orgName: 'my-org',
   *       orgUid: '1234',
   *       stageName: 'prod',
   *       appName: 'my-app',
   *       instanceName: 'my-instance'
   *     }
   *   })
   */
  config(config = {}) {
    this.accessKey = config.accessKey || this.accessKey; // Can be either an Access Key or an ID Token
    this.platformStage = process.env.SERVERLESS_PLATFORM_STAGE || config.platformStage || 'prod';
    config.context = config.context || {};
    this.context.orgUid = config.context.orgUid || this.context.orgUid || null;
    this.context.orgName = config.context.orgName || this.context.orgName || null;
    this.context.stageName = config.context.stageName || this.context.stageName || null;
    this.context.appName = config.context.appName || this.context.appName || null;
    this.context.instanceName = config.context.instanceName || this.context.instanceName || null;
    this.context.componentName = config.context.componentName || this.context.componentName || null;
    this.context.componentVersion =
      config.context.componentVersion || this.context.componentVersion || null;
  }

  /**
   * Gets a domain for a specific service: 'engine', 'registry', 'events-streaming'
   * @param {string} serviceName The name of the Serverless Platform Service you want the domain for.
   * @return {string} The domain of that service.
   */
  getDomain(serviceName = null) {
    return this.domains[serviceName] || null;
  }

  loginIdentity(config = {}) {
    const ws = new WS(`${config.loginBrokerUrl}broker`, undefined, {
      followRedirects: true,
      agent: utils.getAgent(),
    });

    let resolveTransactionId;
    let rejectTransactionId;
    const transactionId = new Promise((resolve, reject) => {
      resolveTransactionId = resolve;
      rejectTransactionId = reject;
    });

    let resolveLoginData;
    let rejectLoginData;
    const loginData = new Promise((resolve, reject) => {
      resolveLoginData = resolve;
      rejectLoginData = reject;
    });

    const sanitizeLoginData = (data) => {
      delete data.event;
      const decoded = jwtDecode(data.id_token);

      return {
        id: decoded.tracking_id || decoded.sub,
        name: decoded.name,
        email: decoded.email,
        username: data.username,
        refreshToken: data.refresh_token,
        accessToken: data.access_token,
        idToken: data.id_token,
        expiresAt: data.expires_in ? Date.now() + data.expires_in : data.expires_at,
      };
    };

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        // console.log(data)
        switch (data.event) {
          case 'ready':
            resolveTransactionId(data.transactionId);
            break;
          case 'fulfilled': {
            const sanitizedLoginData = sanitizeLoginData(data);
            resolveLoginData(sanitizedLoginData);
            ws.close();
            break;
          }
          default:
            throw new Error(
              'Encountered an unexpected message while waiting for login information. Your Serverless Framework or SDK may be out of date.'
            );
        }
      } catch (error) {
        rejectTransactionId(error);
        rejectLoginData(error);
        ws.close();
      }
    };

    ws.onopen = () => {
      ws.send('{"action":"login"}');
    };

    return {
      transactionId,
      loginData,
    };
  }

  async login(config = {}) {
    const { transactionId: deferredTransactionId, loginData } = this.loginIdentity(config);

    const transactionId = await deferredTransactionId;

    const auth0Queries = querystring.stringify({
      client: 'cli',
      transactionId,
    });
    let loginUrl = `${this.getDomain('dashboard')}`;
    loginUrl = `${loginUrl}?${auth0Queries}`;

    return {
      loginUrl,
      loginData,
    };
  }

  /**
   *
   * Resources
   *
   */

  /**
   * Get User account
   * @return {object} Returns a user record.
   */
  async getUser() {
    return resources.getUser(this);
  }

  /**
   * Get User account meta information.
   * @return {object} Returns a data object of custom "meta" information.
   */
  async getUserMeta() {
    return resources.getUserMeta(this);
  }

  /**
   * Updates User account meta information.  This method fetches meta information and merges it with the meta object you provide before saving.  Please note that this does a shallow merge and not a deep merge.  That means nested properties might be replaced.
   * @param {object} userMeta An object of new userMeta that will be automaticaly merged with the old user meta.
   * @return {object} Returns a data object of User data.
   */
  async saveUserMeta(userMeta) {
    return resources.saveUserMeta(this, userMeta);
  }

  /**
   * Validates whether a potential User and Organization name meets the Platform requirements.  Most importantly, this calls the Platform to validate whether the User and Organization names are already taken.  This method is necessary because every User must have an Organization and we want to be sure both namespaces are availbale, before creating one or the other.  In the future, both of these records should be created in the back-end, not on the client-side.  Until then, this method is essential.
   * @param {string} userAndOrgName The name of the User and Org name.
   * @return {array} Returns an array of validation errors, if any.  Otherwise, returns null.
   */
  async validateUserAndOrgName(userAndOrgName) {
    return resources.validateUserAndOrgName(this, userAndOrgName);
  }

  /**
   * In the Serverless Platform, every User must have an Organization by default.  This method creates both a User and an Organization record, at the same time.  Please note, the endpoint called is specific to Tenants (Organizations), which also has User creation logic within it.  This API design is non-sensible and we should consider a better API design ASAP.  Until then, this method abstracts over that.
   * @param {string} userAndOrgName The name of the User and Org name.
   * @return {object} Returns the newly create Organization.
   */
  async createUserAndOrg(userAndOrgName) {
    return resources.createUserAndOrg(this, userAndOrgName);
  }

  /**
   * Creates an Organization.
   * @param {string} userAndOrgName The name of the Organization you wish to create.  WARNING: This also creates a User record if one does not exist under this Organization name.  This API design needs improvement.
   * @return {object} Returns the newly create Organization.
   */
  async createOrg(userAndOrgName) {
    return resources.createOrg(this, userAndOrgName);
  }

  /**
   * Gets an Organization by Organization name.
   * @param {string} orgName The name of the Organization you wish to retrieve.
   * @return {object} Returns the Organization record.
   */
  async getOrgByName(orgName) {
    return resources.getOrgByName(this, orgName);
  }

  /**
   * Lists Organizations by User, whether the  User is an Owner or a Member of a given Organization.
   * @param {string} username The name of the User whose Organizations you wish to list.
   * @return {object} Returns an array of Organizations
   */
  async listOrgs(username) {
    return resources.listOrgs(this, username);
  }

  /**
   * Create an Application within an Organization
   * @param {string} orgName The name of the Organization you wish to create an Application in.
   * @param {string} app.name The name of the Application.
   * @param {string} app.description The description of the Application.
   * @param {object} app.deploymentProfiles An object of deployment profiles and stages.  This structure is a bit confusing.  Look at the back-end service for more details and hopefully we can design this more elegantly in the future.
   * @return {object} Returns a data object of the newly created Application
   */
  async createApp(orgName = null, app = {}) {
    return resources.createApp(this, orgName, app);
  }

  /**
   * Update an Application within an Organization
   * @param {string} orgName The name of the Organization the Application belongs to.
   * @param {string} app.name The name of the Application you wish to update.  This property cannot be updated due to current data modeling issues.
   * @param {string} app.description The description of the Application.  This property can be updated.
   * @param {object} app.deploymentProfiles An object of deployment profiles and stages.  This property can be updated.  This structure is a bit confusing. Look at the back-end service for more details and hopefully we can design this more elegantly in the future.
   * @return {object} Returns a data object of the updated Application
   */
  async updateApp(orgName = null, app = {}) {
    return resources.updateApp(this, orgName, app);
  }

  /**
   * Delete an Application within an Organization
   * @param {string} orgName The name of the Organization the Application belongs to.
   * @param {string} appName The name of the Application you wish to delete.
   */
  async deleteApp(orgName = null, appName = null) {
    return resources.updateApp(this, orgName, appName);
  }

  /**
   * List all Applications within an Organization
   * @param {string} orgName The name of the Organization the Application belongs to.
   */
  async listApps(orgName = null) {
    return resources.listApps(this, orgName);
  }

  /**
   * Create an initToken for a user and organization
   * @param {string} orgName The name of the Organization the Init Token belongs to.
   * @param {string} template.type Must be either s3, github, or existing.
   * @param {string[]} template.commands Array of commands executed by the user's shell env in order to fetch and set up the template
   */
  async createInitToken(orgName = null, template = {}) {
    return resources.createInitToken(this, orgName, template);
  }

  /**
   * Get an initToken by UID
   * @param {string} initTokenUid Unique identifier of an initToken
   */
  async getInitToken(initTokenUid) {
    return resources.getInitToken(this, initTokenUid);
  }

  /**
   * Create a provider
   *
   * @param {*} orgUid
   * @param {*} data
   */
  async createProvider(orgUid, data) {
    return resources.createProvider(this, orgUid, data);
  }

  /**
   * Update a provider
   *
   * @param {*} orgUid
   * @param {*} providerUid
   * @param {*} data
   */
  async updateProvider(orgUid, providerUid, data) {
    return resources.updateProvider(this, orgUid, providerUid, data);
  }

  /**
   * Delete a provider
   *
   * @param {*} orgUid
   * @param {*} providerUid
   */
  async deleteProvider(orgUid, providerUid) {
    return resources.deleteProvider(this, orgUid, providerUid);
  }

  /**
   * Create a providerLink
   * Link type can be either `service` or `instance`
   *
   * @param {*} orgUid
   * @param {*} linkType
   * @param {*} linkUid
   * @param {*} providerUid
   */
  async createProviderLink(orgUid, linkType, linkUid, providerUid) {
    return resources.createProviderLink(this, orgUid, linkType, linkUid, providerUid);
  }

  /**
   * Delete a providerLink
   * Link type can be either `service` or `instance`
   * @param {*} orgUid
   * @param {*} linkType
   * @param {*} linkUid
   * @param {*} providerUid
   */
  async deleteProviderLink(orgUid, linkType, linkUid, providerUid) {
    return resources.deleteProviderLink(this, orgUid, linkType, linkUid, providerUid);
  }
  /**
   * List providers by OrgUid
   * @param {*} orgUid
   */
  async getProviders(orgUid) {
    return resources.getProviders(this, orgUid);
  }

  /**
   * Get a Provider
   * @param {*} orgUid
   * @param {*} providerUid
   */
  async getProvider(orgUid, providerUid) {
    return resources.getProvider(this, orgUid, providerUid);
  }

  /**
   * Get providers by org, service, and instance
   * Configuration set at the instance level will override
   * defaults set at the service level
   *
   * @param {*} orgUid
   * @param {*} serviceUid
   * @param {*} instanceUid
   */
  async getProvidersByOrgServiceInstance(orgUid, serviceUid, instanceUid) {
    return resources.getProvidersByOrgServiceInstance(this, orgUid, serviceUid, instanceUid);
  }

  async getProvidersByLink(orgUid, linkType, linkUid) {
    return resources.getProvidersByLink(this, orgUid, linkType, linkUid);
  }

  /**
   *
   * Events
   *
   */

  /**
   * Establishes a websockets connection with the Serverless Platform
   * @param {string} options.orgName Name of the Serverless Platform Org.
   * @param {string} options.orgUid ID of the Serverless Platform Org.
   * @param {function} options.onEvent A function that handles events recieved from the Serverless Platform
   * @param {string} options.filter Filters which events this connection should receive
   * @param {string} options.filter.stageName Tells the SDK to only receive events on a specific stage
   * @param {string} options.filter.appName Tells the SDK to only receive events on a specific app
   * @param {string} options.filter.instanceName Tells the SDK to only receive events on a specific service
   * @return {null}
   */
  async connect(options = {}) {
    this.connection = new Connection(this);
    await this.connection.connect(options);
  }

  /**
   * Disconnects a websockets connection with the Serverless Platform
   * @return {null}
   */
  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
    }
  }

  /**
   * Checks if the SDK is currently connected to the Serverless Platform
   * @return {boolean} Will return true if the websocket connection is active.
   */
  isConnected() {
    if (!this.connection || !this.connection.isConnected()) {
      return false;
    }
    return true;
  }

  /**
   * Publishes a Serverless Platform Event via Websockets.  The use-case for this is asynchronous publishing, where you do not want to synchronous auth requests, where every message must be authorized first, adding latency.
   * @return {null}
   */
  publish(event) {
    if (!this.isConnected()) {
      throw new Error('You are not currently connected to the Serverless Platform.');
    }
    this.eventer.send(event);
  }

  /**
   * Publishes Serverless Platform Event(s) via HTTP API.  The use-case for this is synchronous publishing, where you do not want to open a websockets connection.
   * @param {object} events An event object, or if publishing a batch of events, an array of event objects, each structured as follows:
   * ```json
   * {
   *   "event": "name",
   *   "data": {
   *     "object": {
   *       "object": "name",
   *       ...properties
   *     },
   *     "previous_attributes": {
   *       ...properties
   *     }
   *   }
   * }
   * ```
   * With `previous_attributes` only being set on `*.updated` event types, and contains the properties with values as of before the update.
   * @returns {Promise<null>} A successful publish request will be ack'ed with a 200:OK HTTP status and empty response.
   */
  async publishSync(events) {
    return this.eventer.publish(events);
  }

  /**
   * Retrieve a Serverless Platform Event.
   * @param {string} uid UID of event to be fetched
   * @returns {Promise<object>} An event object if a valid id was provided. All events share a common structure, detailed below. The only property that will differ is the `data` payload.
   * ```json
   * {
   *   "uid": "evt_P3Soi8VviLNve2QYd6zasxSc",
   *   "event": "application.init_token.created",
   *   "created": 1594652316623,
   *   "data": {
   *     "object": {
   *       "object": "init_token",
   *       "template": {
   *         "directory": "my-fullstack-app",
   *         "packageName": "fullstack-app",
   *         "projectType": "components",
   *         "serviceName": "my-fullstack-app",
   *         "type": "registry"
   *       },
   *       "uid": "ae9L37wJym0",
   *       "user_uid": "MswS9z6GtpSd6gG694",
   *       "username": "testuser123"
   *     }
   *   }
   * }
   * ```
   */
  getEvent(uid) {
    return this.eventer.getEvent(uid);
  }

  /**
   * List all Serverless Platform events.
   * @param {Object} options List options
   * @param {string} options.org_name The name of the Serverless Platform Organization. Optional. By default, fetches events under the connecting organization.
   * @param {string} options.org_uid UID of the Serverless Platform Organization. Optional. By default, fetches events under the connecting organization.
   * @param {string} options.event A string containing a specific event name, or all events by using `'*'` as a wildcard.
   * @param {number} options.limit A limit on the number of events to be returned. Limit can range between 1 and 100, and the default is 10.
   * @param {number} options.created A filter on the list based on the object created field. The value can be an integer Unix timestamp, or it can be a dictionary with the following options: - `created.gt`, `created.gte`, `created.lt`, `created.lte` returning results where the event `created` field is greater, greater than or equal to, lesser than, or lesser than or equal to respectively.
   * @param {string} options.starting_after A cursor for use in pagination. `starting_after` is an event ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with `evt_foo`, your subsequent call can include `starting_after=evt_foo` in order to fetch the next page of the list.
   * @returns {Promise<object>} A dictionary with a `data` property that contains an array of up to `limit` events, starting after event `starting_after`. Each entry in the array is a separate `event` object. If no more events are available, the resulting array will be empty.
   * ```json
   * {
   *   "object": "list",
   *   "data": [
   *     {
   *       "uid": "evt_P3Soi8VviLNve2QYd6zasxSc",
   *       "event": "application.init_token.created",
   *       "created": 1594652316623,
   *       "data": {
   *         "object": {
   *           "object": "init_token",
   *           "template": {
   *             "directory": "my-fullstack-app",
   *             "packageName": "fullstack-app",
   *             "projectType": "components",
   *             "serviceName": "my-fullstack-app",
   *             "type": "registry"
   *           },
   *           "uid": "ae9L37wJym0",
   *           "user_uid": "MswS9z6GtpSd6gG694",
   *           "username": "testuser123"
   *         }
   *       }
   *     }
   *     {...},
   *     {...}
   *   ]
   * }
   * ```
   */
  listEvents(options) {
    return this.eventer.listEvents(options);
  }

  /**
   * Unpublishes a package from the registry
   * @param {*} registryPackage An object containing the properties of a registry package.
   */
  async unpublishFromRegistry(registryPackage = {}) {
    return await registry.unpublish(this, registryPackage);
  }

  /**
   * Publishes a package to the registry
   * @param {*} registryPackage An object containing the properties of a registry package.
   * @returns {object} The published registry package is returned from the Platform API.
   */
  async publishToRegistry(registryPackage = {}) {
    return registry.publish(this, registryPackage);
  }

  /**
   * Fetches package/s from the registry
   * @param {*} name The name of the registry package to fetch. If this is not provided, this method will return a list of everything in the registry.
   * @param {*} version The version of the registry package to fetch.  If this is not provided, this method will always return the latest version.
   * @return {object} Returns a registry package from the Registry.
   */
  async getFromRegistry(name = null, version = null) {
    return registry.get(this, name, version);
  }

  /**
   *
   * Instances
   *
   */

  /**
   * Returns a properly formatted ID for an Instance
   * @param {*} orgUid The Uid of the Serverless Platform Organization.
   * @param {*} stageName The name of the Serverless Platform Stage.
   * @param {*} appUid The Uid of the Serverless Platform Application.
   * @param {*} instanceName The name of the Serverless Platform Instance.
   * @return {object} Returns a properly formatted ID for an Instance
   */
  generateInstanceId(orgName = null, stageName = null, appUid = null, instanceName = null) {
    return instance.generateId(orgName, stageName, appUid, instanceName);
  }

  /**
   * Validates the properties of an Instance, as well as auto-corrects shortened syntax (e.g. org => orgName)
   * @param {*} instanceToValidate The Serverless Platform Instance you want to validate.
   * @return {object} Returns a validated, formatted version of the Instance
   */
  validateInstance(instanceToValidate) {
    return instance.validateAndFormat(instanceToValidate);
  }

  /**
   * Returns a new Instance as a Javascript object.
   * @param {*} orgName The name of the Serverless Platform Organization.
   * @param {*} stageName The name of the Serverless Platform Stage.
   * @param {*} appName The name of the Serverless Platform Application.
   * @param {*} instanceName The name of the Serverless Platform Instance.
   * @return {object} Returns a new Instance definition as a Javascript Object.
   */
  createInstance(orgName = null, stageName = null, appName = null, instanceName = null) {
    return instance.create(orgName, stageName, appName, instanceName);
  }

  /**
   * Get an Instance from the Serverless Platform by it's name and the names of its Organization, Stage, Application.
   * @param {*} orgName The name of the Serverless Platform Organization.
   * @param {*} stageName The name of the Serverless Platform Stage.
   * @param {*} appName The name of the Serverless Platform Application.
   * @param {*} instanceName The name of the Serverless Platform Instance.
   */
  async getInstance(orgName = null, stageName = null, appName = null, instanceName = null) {
    return instance.getByName(this, orgName, stageName, appName, instanceName);
  }

  /**
   * List all Component Instances within an Org, given an org name or org UId
   * @param {*} orgName Optional.  Must include either orgName or orgUid.
   * @param {*} orgUid Optional.  Must include either orgName or orgUid.
   */
  async listInstances(orgName = null, orgUid) {
    return instance.listByOrgName(this, orgName, orgUid);
  }

  /**
   * Run an action on a Component Instance.  Is an asynchronous call by default, but you can perform this synchronously if you set `options.sync`.  Please note that synchronous runs have a 24 second timeout limit.  That is not ideal for long operations, and is not recommended for deployments.
   * @param {*} action
   * @param {*} instanceData
   * @param {*} credentials
   * @param {*} options
   */
  async run(action, instanceData = {}, credentials = {}, options = {}) {
    return instance.run(this, action, instanceData, credentials, options);
  }

  /**
   * Run Finish
   * @param {string} method The action that was performed on the Component.
   * @param {object} instanceData An object representing your Instance definition.
   */
  async runFinish(method = null, instanceData) {
    return instance.runFinish(this, method, instanceData);
  }

  /**
   * Performs a 'deploy' action and polls the 'getInstance' endpoint until its 'instanceStatus' reflects a successful deployment, or error.
   */
  async deploy(instanceData = {}, credentials = {}, options = {}) {
    return instance.deploy(this, instanceData, credentials, options);
  }

  /**
   * Performs a 'remove' action and polls the 'getInstance' endpoint until its 'instanceStatus' reflects a successful deployment, or error.
   */
  async remove(instanceData = {}, credentials = {}, options = {}) {
    return instance.remove(this, instanceData, credentials, options);
  }

  /**
   *
   * Other
   *
   */

  /**
   * Intercepts console 'log' 'debug' and 'error' methods, and sends their data to the Serverless Platform as an Event, before writing to stdout.
   * @param {*} eventType Optional. The event name used to publish logs. Defaults to "instance.logs".
   * @param {*} context Optional. Additional context added to the published log data.
   */
  async startInterceptingLogs(eventType = null, context = {}) {
    // Save original console methods
    this.intercepts.logs = [];
    this.intercepts.console = {};
    this.intercepts.console.log = console.log;
    this.intercepts.console.debug = console.debug;
    this.intercepts.console.info = console.info;
    this.intercepts.console.error = console.error;
    this.intercepts.console.warn = console.warn;

    this.intercepts.stdout = {};
    this.intercepts.stdout.write = process.stdout.write.bind(process.stdout);

    this.intercepts.stderr = {};
    this.intercepts.stderr.write = process.stderr.write.bind(process.stderr);

    const self = this;

    // Publish function
    this.intercepts.publish = async () => {
      if (!self.intercepts.logs || !self.intercepts.logs.length) {
        return;
      }

      // Copy logs and clear them out immediately
      const logsCopy = self.intercepts.logs.map((l) => l);
      self.intercepts.logs = [];

      // Publish event
      const evt = { data: { logs: logsCopy, ...context } };
      evt.event = eventType || 'instance.logs';
      await self.publishSync(evt);
    };

    // Set Interval function
    this.intercepts.interval = setInterval(async () => {
      await self.intercepts.publish();
    }, self.intercepts.logsInterval);

    // Set Intercept function
    const intercept = (type, logs) => {
      // Add logs to queue and format so they print correctly after being sent via Websockets
      logs.forEach((l) => {
        if (l === undefined) {
          l = 'undefined';
        }
        if (typeof l === 'number') {
          l = JSON.stringify(l);
        }

        // Add to logs queue, and add type of log
        const log = { type };
        log.createdAt = Date.now();
        log.data = util.inspect(l); // util.inspect converts ciruclar objects to '[Circular]'.  Without, errors will happen on stringify...
        self.intercepts.logs.push(log);
      });

      // Apply old method
      if (type === 'stdout') {
        self.intercepts.stdout.write(...logs);
      } else if (type === 'stderr') {
        self.intercepts.stderr.write(...logs);
      } else {
        self.intercepts.console[type].apply(console, logs);
      }
    };

    // Replace console methods
    console.log = (...args) => {
      intercept('log', args);
    };
    console.debug = (...args) => {
      intercept('debug', args);
    };
    console.info = (...args) => {
      intercept('info', args);
    };
    console.error = (...args) => {
      intercept('error', args);
    };
    console.warn = (...args) => {
      intercept('warn', args);
    };
    process.stdout.write = (...args) => {
      intercept('stdout', args);
    };
    process.stderr.write = (...args) => {
      intercept('stderr', args);
    };
  }

  /**
   * Stop intercepting console methods
   */
  async stopInterceptingLogs() {
    // Clear interval timer
    if (this.intercepts.interval) {
      clearInterval(this.intercepts.interval);
    }

    // Send any remaining logs
    await this.intercepts.publish();

    // Reset logs
    this.intercepts.logs = [];

    // Replace console methods
    console.log = this.intercepts.console.log;
    console.debug = this.intercepts.console.debug;
    console.info = this.intercepts.console.info;
    console.error = this.intercepts.console.error;
    console.warn = this.intercepts.console.warn;

    process.stdout.write = this.intercepts.stdout.write;
    process.stderr.write = this.intercepts.stderr.write;
  }

  /**
   * Registers a webhook endpoint to receive Serverless Platform events. Endpoint should be able to receieve JSON formatted event as a HTTP POST payload.
   * @param {string} url HTTP webhook endpoint URL.
   * @param {string} options.description An optional description of what the webhook is used for.
   * @param {object} options.filter Optionally, filter which events this endpoint should receive.
   * @param {object} options.filter.enabled_events The list of events to enable for this endpoint. `["*"]` indicates that all events are enabled.
   * @returns {Promise<object>} Registered webhook endpoint.
   * ```json
   * {
   *   "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
   *   "object": "webhook_endpoint",
   *   "url": "https://postb.in/1598300732037-0682672155089",
   *   "description": "This is my webhook, I like it a lot",
   *   "filter": {
   *     "enabled_events": ["*"]
   *   },
   *   "status": {
   *     "disabled": false
   *   },
   *   "created": 1593710260258
   * }
   * ```
   */
  registerWebhook(url, options = {}) {
    return webhooks.register(this, url, options.description, options.filter || {});
  }

  /**
   * Lists all regsitered webhook endpoints.
   * @param {string} options.starting_after A cursor for use in pagination. `starting_after` is a webhook endpoint object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with `whe_foo`, your subsequent call can include `starting_after=whe_foo` in order to fetch the next page of the list.
   * @param {number} options.limit A limit on the number of webhook endpoints to be returned. Limit can range between 1 and 100, and the default is 10.
   * @returns {Promise<object>} A dictionary with a `data` property that contains an array, with each entry being a `webhook` object.
   * ```json
   * {
   *   "object": "list",
   *   "data": [
   *     {
   *       "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
   *       "object": "webhook_endpoint",
   *       "url": "https://postb.in/1598300732037-0682672155089",
   *       "description": "This is my webhook, I like it a lot",
   *       "filter": {
   *         "enabled_events": ["*"]
   *       },
   *       "status": {
   *         "disabled": false,
   *         "most_recent_delivery": {
   *           "event_uid": "evt_5cmXN7kqdu5YY69HFKegmiGR",
   *           "response_status_code": 200,
   *           "response_headers": {
   *             "content-length": "12",
   *             "connection": "close",
   *             "content-type": "application/json"
   *           },
   *           "request_headers": {
   *             "User-Agent": "Serverless-Webhook/0.1",
   *             "Content-type": "application/json",
   *             "X-Serverless-Delivery": "e1701c44-5d92-4515-8bfb-6c9173a89b60",
   *             "X-Serverless-Event": "test.webhook.send2"
   *           },
   *           "response_text": "{\"ok\": true}",
   *           "error_message": null,
   *           "timestamp": 1599595612876
   *         }
   *       },
   *       "created": 1599591851267,
   *       "updated": 1599595613099
   *     },
   *     {...},
   *     {...}
   *   ]
   * }
   * ```
   */
  listWebhooks(options = {}) {
    const { starting_after: startingAfter, limit = 10 } = options;
    return webhooks.list(this, startingAfter, limit);
  }

  /**
   * Retrieves a webhook endpoint with the given ID.
   * @param {string} uid Webhook endpoint ID.
   * @returns {Promise<object>} A webhook endpoint if a valid webhook endpoint ID was provided.
   * ```json
   * {
   *   "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
   *   "object": "webhook_endpoint",
   *   "url": "https://postb.in/1598300732037-0682672155089",
   *   "description": "This is my webhook, I like it a lot",
   *   "filter": {
   *     "enabled_events": ["*"]
   *   },
   *   "status": {
   *     "disabled": false,
   *     "most_recent_delivery": {
   *       "event_uid": "evt_5cmXN7kqdu5YY69HFKegmiGR",
   *       "response_status_code": 200,
   *       "response_headers": {
   *         "content-length": "12",
   *         "connection": "close",
   *         "content-type": "application/json"
   *       },
   *       "request_headers": {
   *         "User-Agent": "Serverless-Webhook/0.1",
   *         "Content-type": "application/json",
   *         "X-Serverless-Delivery": "e1701c44-5d92-4515-8bfb-6c9173a89b60",
   *         "X-Serverless-Event": "test.webhook.send2"
   *       },
   *       "response_text": "{\"ok\": true}",
   *       "error_message": null,
   *       "timestamp": 1599595612876
   *     }
   *   },
   *   "created": 1599591851267,
   *   "updated": 1599595613099
   * }
   */
  getWebhook(uid) {
    return webhooks.get(this, uid);
  }

  /**
   * Updates the registered webhook endpoint. You may edit the url, description, the list of filters, and the status of your endpoint.
   * @param {string} uid Webhook endpoint ID.
   * @param {string} updates.url HTTP webhook endpoint url, if updating.
   * @param {string} updates.description An optional updated description of what the webhook is used for.
   * @param {object} updates.filter Optionally, update filter which events this endpoint should receive. An existing filter can reset by setting it to `null`.
   * @param {object} updates.filter.enabled_events The list of events to enable for this endpoint. `["*"]` indicates that all events are enabled.
   * @param {boolean} updates.status.disabled Enable/disable the webhook endpoint.
   * @returns {Promise<object>} Updated webhook endpoint.
   * ```json
   * {
   *   "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
   *   "object": "webhook_endpoint",
   *   "url": "https://postb.in/1598300732037-0682672155089",
   *   "description": "This is my webhook, I like it a lot",
   *   "filter": {
   *     "enabled_events": ["*"]
   *   },
   *   "status": {
   *     "disabled": false
   *   },
   *   "created": 1593710260258
   * }
   * ```
   */
  updateWebhook(uid, updates) {
    return webhooks.update(this, uid, updates || {});
  }

  /**
   * Deletes the webhook endpoint with the given ID.
   * @param {string} uid Webhook endpoint ID.
   * @returns {Promise<object>} An object with the deleted webhook endpoints’s ID if a valid webhook endpoint ID was provided. Otherwise, this call throws an error, such as if the webhook endpoint has already been deleted.
   * ```json
   * {
   *   "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
   *   "object": "webhook_endpoint",
   *   "deleted": true
   * }
   */
  deleteWebhook(uid) {
    return webhooks.remove(this, uid);
  }
}

/**
 * Exports
 */
module.exports = {
  ServerlessSDK,
  utils,
};
