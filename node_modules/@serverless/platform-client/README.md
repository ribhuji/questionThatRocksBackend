# Serverless Platform SDK

This Serverless Platform SDK makes it easy to interact with the Serverless Platform and perform operations on it. Please note that there is an existing `@serverless/platform-sdk` npm module for interacting with the Serverless Inc. SaaS original platform services. This SDK is for the new services, which are multi-cloud, self-hostable and focued on Components. At some point, we will try to merge these SDKs.

The SDK is light-weight, so that it can be used in the following: CLIs, Dashboards, Back-End Services, FaaS Layers. Please **DO NOT** add any big Node.js dependencies to this SDK.

This SDK should guide the interface design between Services and Clients. All Clients and Services **MUST** use the SDK and should never hardcode API endpoints or FaaS resources identifiers.

## Quick-Start

**If you are working within a Node.js environment, install the Serverless Platform Client SDK via NPM:**

```
npm i @serverless/platform-client
```

**If you are working within a web/browser environment, use the CDN hosted Serverless Platform Client SDK:**

This is minified, tree-shaked, browserified. The CDN fetches it directly from NPM, so just reference any npm version, like below.

This CDN service has several locations in China, so it works well there.

```
// In index.html <head></head>
<!-- Load the Serverless Platform (Components) SDK -->
<script src="https://cdn.jsdelivr.net/npm/@serverless/platform-client@0.17.2" async></script>
```

You can also pin to the latest version, but this could break at any time:

```
// In index.html <head></head>
<!-- Load the Serverless Platform (Components) SDK -->
<script src="https://cdn.jsdelivr.net/npm/@serverless/platform-client" async></script>
```

If you are working with the `dev` environment of the Serverless Platform, set the following environment variable, or configure the client programmatically, as detailed below.

```
export SERVERLESS_PLATFORM_STAGE=dev
```

Here is how you require, instantiate the Client and use it:

```javascript
const { ServerlessSDK } = require("@serverless/platform-client");

sdk = new ServerlessSDK({
  platformStage: "dev", // Optional.  Defaults to 'prod'
  accessKey: "JA98JAJFASLFJSALFJASLFJ", // Optional, but recommended.  Platform Access Key needed to identify all requests.
});

const instances = await sdk.listInstances("my-org");
```

<a name="ServerlessSDK"></a>

## ServerlessSDK

The Serverless Platform SDK Class

**Kind**: global class

- [ServerlessSDK](#ServerlessSDK)
  - [new ServerlessSDK()](#new_ServerlessSDK_new)
  - [.config()](#ServerlessSDK+config) ⇒ <code>null</code>
  - [.getDomain(serviceName)](#ServerlessSDK+getDomain) ⇒ <code>string</code>
  - [.getUser()](#ServerlessSDK+getUser) ⇒ <code>object</code>
  - [.getUserMeta()](#ServerlessSDK+getUserMeta) ⇒ <code>object</code>
  - [.saveUserMeta(userMeta)](#ServerlessSDK+saveUserMeta) ⇒ <code>object</code>
  - [.validateUserAndOrgName(userAndOrgName)](#ServerlessSDK+validateUserAndOrgName) ⇒ <code>array</code>
  - [.createUserAndOrg(userAndOrgName)](#ServerlessSDK+createUserAndOrg) ⇒ <code>object</code>
  - [.createOrg(userAndOrgName)](#ServerlessSDK+createOrg) ⇒ <code>object</code>
  - [.getOrgByName(orgName)](#ServerlessSDK+getOrgByName) ⇒ <code>object</code>
  - [.listOrgs(username)](#ServerlessSDK+listOrgs) ⇒ <code>object</code>
  - [.createApp(orgName)](#ServerlessSDK+createApp) ⇒ <code>object</code>
  - [.updateApp(orgName)](#ServerlessSDK+updateApp) ⇒ <code>object</code>
  - [.deleteApp(orgName, appName)](#ServerlessSDK+deleteApp)
  - [.listApps(orgName)](#ServerlessSDK+listApps)
  - [.createInitToken(orgName)](#ServerlessSDK+createInitToken)
  - [.getInitToken(initTokenUid)](#ServerlessSDK+getInitToken)
  - [.createProvider(orgUid, data)](#ServerlessSDK+createProvider)
  - [.updateProvider(orgUid, providerUid, data)](#ServerlessSDK+updateProvider)
  - [.deleteProvider(orgUid, providerUid)](#ServerlessSDK+deleteProvider)
  - [.createProviderLink(orgUid, linkType, linkUid, providerUid)](#ServerlessSDK+createProviderLink)
  - [.deleteProviderLink(orgUid, linkType, linkUid, providerUid)](#ServerlessSDK+deleteProviderLink)
  - [.getProviders(orgUid)](#ServerlessSDK+getProviders)
  - [.getProvider(orgUid, providerUid)](#ServerlessSDK+getProvider)
  - [.getProvidersByOrgServiceInstance(orgUid, serviceUid, instanceUid)](#ServerlessSDK+getProvidersByOrgServiceInstance)
  - [.connect()](#ServerlessSDK+connect) ⇒ <code>null</code>
  - [.disconnect()](#ServerlessSDK+disconnect) ⇒ <code>null</code>
  - [.isConnected()](#ServerlessSDK+isConnected) ⇒ <code>boolean</code>
  - [.publish()](#ServerlessSDK+publish) ⇒ <code>null</code>
  - [.publishSync(events)](#ServerlessSDK+publishSync) ⇒ <code>Promise.&lt;null&gt;</code>
  - [.getEvent(uid)](#ServerlessSDK+getEvent) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.listEvents(options)](#ServerlessSDK+listEvents) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.unpublishFromRegistry(registryPackage)](#ServerlessSDK+unpublishFromRegistry)
  - [.publishToRegistry(registryPackage)](#ServerlessSDK+publishToRegistry) ⇒ <code>object</code>
  - [.getFromRegistry(name, version)](#ServerlessSDK+getFromRegistry) ⇒ <code>object</code>
  - [.generateInstanceId(orgUid, stageName, appUid, instanceName)](#ServerlessSDK+generateInstanceId) ⇒ <code>object</code>
  - [.validateInstance(instanceToValidate)](#ServerlessSDK+validateInstance) ⇒ <code>object</code>
  - [.createInstance(orgName, stageName, appName, instanceName)](#ServerlessSDK+createInstance) ⇒ <code>object</code>
  - [.getInstance(orgName, stageName, appName, instanceName)](#ServerlessSDK+getInstance)
  - [.listInstances(orgName, orgUid)](#ServerlessSDK+listInstances)
  - [.run(action, instanceData, credentials, options)](#ServerlessSDK+run)
  - [.runFinish(method, instanceData)](#ServerlessSDK+runFinish)
  - [.deploy()](#ServerlessSDK+deploy)
  - [.remove()](#ServerlessSDK+remove)
  - [.startInterceptingLogs(eventType, context)](#ServerlessSDK+startInterceptingLogs)
  - [.stopInterceptingLogs()](#ServerlessSDK+stopInterceptingLogs)
  - [.registerWebhook(url)](#ServerlessSDK+registerWebhook) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.listWebhooks()](#ServerlessSDK+listWebhooks) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.getWebhook(uid)](#ServerlessSDK+getWebhook) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.updateWebhook(uid)](#ServerlessSDK+updateWebhook) ⇒ <code>Promise.&lt;object&gt;</code>
  - [.deleteWebhook(uid)](#ServerlessSDK+deleteWebhook) ⇒ <code>Promise.&lt;object&gt;</code>

<a name="new_ServerlessSDK_new"></a>

### new ServerlessSDK()

Creates an instance of the SDK. Accepts a configuration object and calls the `config()` method. See the `config()` method for more information on allowed configuration.

| Param                      | Type                | Description                                                                                                                                                                              |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [config.accessKey]         | <code>string</code> | Can either be a Serverless Platform Access Key or an ID Token.                                                                                                                           |
| [config.platformStage]     | <code>string</code> | The Serverless Platform Stage you wish to interact with. This can also be set by the environment variable SERVERLESS_PLATFORM_STAGE=                                                     |
| [context.orgName]          | <code>string</code> | The name of the Serverless Platform Organization you wish to interact with. If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish. |
| [context.orgUid]           | <code>string</code> | The ID of the Serverless Platform Organization you wish to interact with. If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.   |
| [context.stageName]        | <code>string</code> | The Serverless Platform Organization Stage you wish to interact with. If set, this value is auto-added to every Event you publish.                                                       |
| [context.appName]          | <code>string</code> | The Serverless Platform Application you wish to interact with. If set, this value is auto-added to every Event you publish.                                                              |
| [context.instanceName]     | <code>string</code> | The Serverless Platform Instance you wish to interact with. If set, this value is auto-added to every Event you publish.                                                                 |
| [context.componentName]    | <code>string</code> | The Serverless Platform Component you wish to interact with. If set, this value is auto-added to every Event you publish.                                                                |
| [context.componentVersion] | <code>string</code> | The Serverless Platform Component version you wish to interact with. If set, this value is auto-added to every Event you publish.                                                        |

**Example**

```js
const { ServerlessSDK } = require("@serverless/platform-client");

const sdk = new ServerlessSDK({
  accessKey: "123456789",
  context: {
    orgName: "my-org",
    orgUid: "1234",
    stageName: "prod",
    appName: "my-app",
    instanceName: "my-instance",
  },
});
```

<a name="ServerlessSDK+config"></a>

### serverlessSDK.config() ⇒ <code>null</code>

Updates the SDK configuration

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param                      | Type                | Description                                                                                                                                                                              |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [config.accessKey]         | <code>string</code> | Can either be a Serverless Platform Access Key or an ID Token.                                                                                                                           |
| [config.platformStage]     | <code>string</code> | The Serverless Platform Stage you wish to interact with. This can also be set by the environment variable SERVERLESS_PLATFORM_STAGE=                                                     |
| [context.orgName]          | <code>string</code> | The name of the Serverless Platform Organization you wish to interact with. If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish. |
| [context.orgUid]           | <code>string</code> | The ID of the Serverless Platform Organization you wish to interact with. If set, this value is used upon creating a Websockets connection, and auto-added to every Event you publish.   |
| [context.stageName]        | <code>string</code> | The Serverless Platform Organization Stage you wish to interact with. If set, this value is auto-added to every Event you publish.                                                       |
| [context.appName]          | <code>string</code> | The Serverless Platform Application you wish to interact with. If set, this value is auto-added to every Event you publish.                                                              |
| [context.instanceName]     | <code>string</code> | The Serverless Platform Instance you wish to interact with. If set, this value is auto-added to every Event you publish.                                                                 |
| [context.componentName]    | <code>string</code> | The Serverless Platform Component you wish to interact with. If set, this value is auto-added to every Event you publish.                                                                |
| [context.componentVersion] | <code>string</code> | The Serverless Platform Component version you wish to interact with. If set, this value is auto-added to every Event you publish.                                                        |

**Example**

```js
const { ServerlessSDK } = require("@serverless/platform-client");

const sdk = new ServerlessSDK();
sdk.config({
  accessKey: "123456789",
  context: {
    orgName: "my-org",
    orgUid: "1234",
    stageName: "prod",
    appName: "my-app",
    instanceName: "my-instance",
  },
});
```

<a name="ServerlessSDK+getDomain"></a>

### serverlessSDK.getDomain(serviceName) ⇒ <code>string</code>

Gets a domain for a specific service: 'engine', 'registry', 'events-streaming'

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>string</code> - The domain of that service.

| Param       | Type                | Default           | Description                                                          |
| ----------- | ------------------- | ----------------- | -------------------------------------------------------------------- |
| serviceName | <code>string</code> | <code>null</code> | The name of the Serverless Platform Service you want the domain for. |

<a name="ServerlessSDK+getUser"></a>

### serverlessSDK.getUser() ⇒ <code>object</code>

Get User account

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a user record.  
<a name="ServerlessSDK+getUserMeta"></a>

### serverlessSDK.getUserMeta() ⇒ <code>object</code>

Get User account meta information.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a data object of custom "meta" information.  
<a name="ServerlessSDK+saveUserMeta"></a>

### serverlessSDK.saveUserMeta(userMeta) ⇒ <code>object</code>

Updates User account meta information. This method fetches meta information and merges it with the meta object you provide before saving. Please note that this does a shallow merge and not a deep merge. That means nested properties might be replaced.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a data object of User data.

| Param    | Type                | Description                                                                        |
| -------- | ------------------- | ---------------------------------------------------------------------------------- |
| userMeta | <code>object</code> | An object of new userMeta that will be automaticaly merged with the old user meta. |

<a name="ServerlessSDK+validateUserAndOrgName"></a>

### serverlessSDK.validateUserAndOrgName(userAndOrgName) ⇒ <code>array</code>

Validates whether a potential User and Organization name meets the Platform requirements. Most importantly, this calls the Platform to validate whether the User and Organization names are already taken. This method is necessary because every User must have an Organization and we want to be sure both namespaces are availbale, before creating one or the other. In the future, both of these records should be created in the back-end, not on the client-side. Until then, this method is essential.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>array</code> - Returns an array of validation errors, if any. Otherwise, returns null.

| Param          | Type                | Description                        |
| -------------- | ------------------- | ---------------------------------- |
| userAndOrgName | <code>string</code> | The name of the User and Org name. |

<a name="ServerlessSDK+createUserAndOrg"></a>

### serverlessSDK.createUserAndOrg(userAndOrgName) ⇒ <code>object</code>

In the Serverless Platform, every User must have an Organization by default. This method creates both a User and an Organization record, at the same time. Please note, the endpoint called is specific to Tenants (Organizations), which also has User creation logic within it. This API design is non-sensible and we should consider a better API design ASAP. Until then, this method abstracts over that.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns the newly create Organization.

| Param          | Type                | Description                        |
| -------------- | ------------------- | ---------------------------------- |
| userAndOrgName | <code>string</code> | The name of the User and Org name. |

<a name="ServerlessSDK+createOrg"></a>

### serverlessSDK.createOrg(userAndOrgName) ⇒ <code>object</code>

Creates an Organization.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns the newly create Organization.

| Param          | Type                | Description                                                                                                                                                                      |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| userAndOrgName | <code>string</code> | The name of the Organization you wish to create. WARNING: This also creates a User record if one does not exist under this Organization name. This API design needs improvement. |

<a name="ServerlessSDK+getOrgByName"></a>

### serverlessSDK.getOrgByName(orgName) ⇒ <code>object</code>

Gets an Organization by Organization name.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns the Organization record.

| Param   | Type                | Description                                        |
| ------- | ------------------- | -------------------------------------------------- |
| orgName | <code>string</code> | The name of the Organization you wish to retrieve. |

<a name="ServerlessSDK+listOrgs"></a>

### serverlessSDK.listOrgs(username) ⇒ <code>object</code>

Lists Organizations by User, whether the User is an Owner or a Member of a given Organization.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns an array of Organizations

| Param    | Type                | Description                                                |
| -------- | ------------------- | ---------------------------------------------------------- |
| username | <code>string</code> | The name of the User whose Organizations you wish to list. |

<a name="ServerlessSDK+createApp"></a>

### serverlessSDK.createApp(orgName) ⇒ <code>object</code>

Create an Application within an Organization

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a data object of the newly created Application

| Param                  | Type                | Default           | Description                                                                                                                                                                                  |
| ---------------------- | ------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orgName                | <code>string</code> | <code>null</code> | The name of the Organization you wish to create an Application in.                                                                                                                           |
| app.name               | <code>string</code> |                   | The name of the Application.                                                                                                                                                                 |
| app.description        | <code>string</code> |                   | The description of the Application.                                                                                                                                                          |
| app.deploymentProfiles | <code>object</code> |                   | An object of deployment profiles and stages. This structure is a bit confusing. Look at the back-end service for more details and hopefully we can design this more elegantly in the future. |

<a name="ServerlessSDK+updateApp"></a>

### serverlessSDK.updateApp(orgName) ⇒ <code>object</code>

Update an Application within an Organization

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a data object of the updated Application

| Param                  | Type                | Default           | Description                                                                                                                                                                                                                |
| ---------------------- | ------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orgName                | <code>string</code> | <code>null</code> | The name of the Organization the Application belongs to.                                                                                                                                                                   |
| app.name               | <code>string</code> |                   | The name of the Application you wish to update. This property cannot be updated due to current data modeling issues.                                                                                                       |
| app.description        | <code>string</code> |                   | The description of the Application. This property can be updated.                                                                                                                                                          |
| app.deploymentProfiles | <code>object</code> |                   | An object of deployment profiles and stages. This property can be updated. This structure is a bit confusing. Look at the back-end service for more details and hopefully we can design this more elegantly in the future. |

<a name="ServerlessSDK+deleteApp"></a>

### serverlessSDK.deleteApp(orgName, appName)

Delete an Application within an Organization

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param   | Type                | Default           | Description                                              |
| ------- | ------------------- | ----------------- | -------------------------------------------------------- |
| orgName | <code>string</code> | <code>null</code> | The name of the Organization the Application belongs to. |
| appName | <code>string</code> | <code>null</code> | The name of the Application you wish to delete.          |

<a name="ServerlessSDK+listApps"></a>

### serverlessSDK.listApps(orgName)

List all Applications within an Organization

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param   | Type                | Default           | Description                                              |
| ------- | ------------------- | ----------------- | -------------------------------------------------------- |
| orgName | <code>string</code> | <code>null</code> | The name of the Organization the Application belongs to. |

<a name="ServerlessSDK+createInitToken"></a>

### serverlessSDK.createInitToken(orgName)

Create an initToken for a user and organization

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param             | Type                              | Default           | Description                                                                                  |
| ----------------- | --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| orgName           | <code>string</code>               | <code>null</code> | The name of the Organization the Init Token belongs to.                                      |
| template.type     | <code>string</code>               |                   | Must be either s3, github, or existing.                                                      |
| template.commands | <code>Array.&lt;string&gt;</code> |                   | Array of commands executed by the user's shell env in order to fetch and set up the template |

<a name="ServerlessSDK+getInitToken"></a>

### serverlessSDK.getInitToken(initTokenUid)

Get an initToken by UID

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param        | Type                | Description                       |
| ------------ | ------------------- | --------------------------------- |
| initTokenUid | <code>string</code> | Unique identifier of an initToken |

<a name="ServerlessSDK+createProvider"></a>

### serverlessSDK.createProvider(orgUid, data)

Create a provider

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param  | Type            |
| ------ | --------------- |
| orgUid | <code>\*</code> |
| data   | <code>\*</code> |

<a name="ServerlessSDK+updateProvider"></a>

### serverlessSDK.updateProvider(orgUid, providerUid, data)

Update a provider

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| providerUid | <code>\*</code> |
| data        | <code>\*</code> |

<a name="ServerlessSDK+deleteProvider"></a>

### serverlessSDK.deleteProvider(orgUid, providerUid)

Delete a provider

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| providerUid | <code>\*</code> |

<a name="ServerlessSDK+createProviderLink"></a>

### serverlessSDK.createProviderLink(orgUid, linkType, linkUid, providerUid)

Create a providerLink
Link type can be either `service` or `instance`

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| linkType    | <code>\*</code> |
| linkUid     | <code>\*</code> |
| providerUid | <code>\*</code> |

<a name="ServerlessSDK+deleteProviderLink"></a>

### serverlessSDK.deleteProviderLink(orgUid, linkType, linkUid, providerUid)

Delete a providerLink
Link type can be either `service` or `instance`

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| linkType    | <code>\*</code> |
| linkUid     | <code>\*</code> |
| providerUid | <code>\*</code> |

<a name="ServerlessSDK+getProviders"></a>

### serverlessSDK.getProviders(orgUid)

List providers by OrgUid

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param  | Type            |
| ------ | --------------- |
| orgUid | <code>\*</code> |

<a name="ServerlessSDK+getProvider"></a>

### serverlessSDK.getProvider(orgUid, providerUid)

Get a Provider

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| providerUid | <code>\*</code> |

<a name="ServerlessSDK+getProvidersByOrgServiceInstance"></a>

### serverlessSDK.getProvidersByOrgServiceInstance(orgUid, serviceUid, instanceUid)

Get providers by org, service, and instance
Configuration set at the instance level will override
defaults set at the service level

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param       | Type            |
| ----------- | --------------- |
| orgUid      | <code>\*</code> |
| serviceUid  | <code>\*</code> |
| instanceUid | <code>\*</code> |

<a name="ServerlessSDK+connect"></a>

### serverlessSDK.connect() ⇒ <code>null</code>

Establishes a websockets connection with the Serverless Platform

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param                       | Type                  | Description                                                          |
| --------------------------- | --------------------- | -------------------------------------------------------------------- |
| options.orgName             | <code>string</code>   | Name of the Serverless Platform Org.                                 |
| options.orgUid              | <code>string</code>   | ID of the Serverless Platform Org.                                   |
| options.onEvent             | <code>function</code> | A function that handles events recieved from the Serverless Platform |
| options.filter              | <code>string</code>   | Filters which events this connection should receive                  |
| options.filter.stageName    | <code>string</code>   | Tells the SDK to only receive events on a specific stage             |
| options.filter.appName      | <code>string</code>   | Tells the SDK to only receive events on a specific app               |
| options.filter.instanceName | <code>string</code>   | Tells the SDK to only receive events on a specific service           |

<a name="ServerlessSDK+disconnect"></a>

### serverlessSDK.disconnect() ⇒ <code>null</code>

Disconnects a websockets connection with the Serverless Platform

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
<a name="ServerlessSDK+isConnected"></a>

### serverlessSDK.isConnected() ⇒ <code>boolean</code>

Checks if the SDK is currently connected to the Serverless Platform

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>boolean</code> - Will return true if the websocket connection is active.  
<a name="ServerlessSDK+publish"></a>

### serverlessSDK.publish() ⇒ <code>null</code>

Publishes a Serverless Platform Event via Websockets. The use-case for this is asynchronous publishing, where you do not want to synchronous auth requests, where every message must be authorized first, adding latency.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
<a name="ServerlessSDK+publishSync"></a>

### serverlessSDK.publishSync(events) ⇒ <code>Promise.&lt;null&gt;</code>

Publishes Serverless Platform Event(s) via HTTP API. The use-case for this is synchronous publishing, where you do not want to open a websockets connection.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;null&gt;</code> - A successful publish request will be ack'ed with a 200:OK HTTP status and empty response.

| Param  | Type                | Description                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| events | <code>object</code> | An event object, or if publishing a batch of events, an array of event objects, each structured as follows: `json { "event": "name", "data": { "object": { "object": "name", ...properties }, "previous_attributes": { ...properties } } } ` With `previous_attributes` only being set on `*.updated` event types, and contains the properties with values as of before the update. |

<a name="ServerlessSDK+getEvent"></a>

### serverlessSDK.getEvent(uid) ⇒ <code>Promise.&lt;object&gt;</code>

Retrieve a Serverless Platform Event.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - An event object if a valid id was provided. All events share a common structure, detailed below. The only property that will differ is the `data` payload.

```json
{
  "uid": "evt_P3Soi8VviLNve2QYd6zasxSc",
  "event": "application.init_token.created",
  "created": 1594652316623,
  "data": {
    "object": {
      "object": "init_token",
      "template": {
        "directory": "my-fullstack-app",
        "packageName": "fullstack-app",
        "projectType": "components",
        "serviceName": "my-fullstack-app",
        "type": "registry"
      },
      "uid": "ae9L37wJym0",
      "user_uid": "MswS9z6GtpSd6gG694",
      "username": "testuser123"
    }
  }
}
```

| Param | Type                | Description                |
| ----- | ------------------- | -------------------------- |
| uid   | <code>string</code> | UID of event to be fetched |

<a name="ServerlessSDK+listEvents"></a>

### serverlessSDK.listEvents(options) ⇒ <code>Promise.&lt;object&gt;</code>

List all Serverless Platform events.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - A dictionary with a `data` property that contains an array of up to `limit` events, starting after event `starting_after`. Each entry in the array is a separate `event` object. If no more events are available, the resulting array will be empty.

```json
{
  "object": "list",
  "data": [
    {
      "uid": "evt_P3Soi8VviLNve2QYd6zasxSc",
      "event": "application.init_token.created",
      "created": 1594652316623,
      "data": {
        "object": {
          "object": "init_token",
          "template": {
            "directory": "my-fullstack-app",
            "packageName": "fullstack-app",
            "projectType": "components",
            "serviceName": "my-fullstack-app",
            "type": "registry"
          },
          "uid": "ae9L37wJym0",
          "user_uid": "MswS9z6GtpSd6gG694",
          "username": "testuser123"
        }
      }
    }
    {...},
    {...}
  ]
}
```

| Param                  | Type                | Description                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| options                | <code>Object</code> | List options                                                                                                                                                                                                                                                                                                                                                       |
| options.org_name       | <code>string</code> | The name of the Serverless Platform Organization. Optional. By default, fetches events under the connecting organization.                                                                                                                                                                                                                                          |
| options.org_uid        | <code>string</code> | UID of the Serverless Platform Organization. Optional. By default, fetches events under the connecting organization.                                                                                                                                                                                                                                               |
| options.event          | <code>string</code> | A string containing a specific event name, or all events by using `'*'` as a wildcard.                                                                                                                                                                                                                                                                             |
| options.limit          | <code>number</code> | A limit on the number of events to be returned. Limit can range between 1 and 100, and the default is 10.                                                                                                                                                                                                                                                          |
| options.created        | <code>number</code> | A filter on the list based on the object created field. The value can be an integer Unix timestamp, or it can be a dictionary with the following options: - `created.gt`, `created.gte`, `created.lt`, `created.lte` returning results where the event `created` field is greater, greater than or equal to, lesser than, or lesser than or equal to respectively. |
| options.starting_after | <code>string</code> | A cursor for use in pagination. `starting_after` is an event ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with `evt_foo`, your subsequent call can include `starting_after=evt_foo` in order to fetch the next page of the list.                                                               |

<a name="ServerlessSDK+unpublishFromRegistry"></a>

### serverlessSDK.unpublishFromRegistry(registryPackage)

Unpublishes a package from the registry

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param           | Type            | Description                                                |
| --------------- | --------------- | ---------------------------------------------------------- |
| registryPackage | <code>\*</code> | An object containing the properties of a registry package. |

<a name="ServerlessSDK+publishToRegistry"></a>

### serverlessSDK.publishToRegistry(registryPackage) ⇒ <code>object</code>

Publishes a package to the registry

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - The published registry package is returned from the Platform API.

| Param           | Type            | Description                                                |
| --------------- | --------------- | ---------------------------------------------------------- |
| registryPackage | <code>\*</code> | An object containing the properties of a registry package. |

<a name="ServerlessSDK+getFromRegistry"></a>

### serverlessSDK.getFromRegistry(name, version) ⇒ <code>object</code>

Fetches package/s from the registry

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a registry package from the Registry.

| Param   | Type            | Default       | Description                                                                                                                       |
| ------- | --------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| name    | <code>\*</code> | <code></code> | The name of the registry package to fetch. If this is not provided, this method will return a list of everything in the registry. |
| version | <code>\*</code> | <code></code> | The version of the registry package to fetch. If this is not provided, this method will always return the latest version.         |

<a name="ServerlessSDK+generateInstanceId"></a>

### serverlessSDK.generateInstanceId(orgUid, stageName, appUid, instanceName) ⇒ <code>object</code>

Returns a properly formatted ID for an Instance

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a properly formatted ID for an Instance

| Param        | Type            | Description                                      |
| ------------ | --------------- | ------------------------------------------------ |
| orgUid       | <code>\*</code> | The Uid of the Serverless Platform Organization. |
| stageName    | <code>\*</code> | The name of the Serverless Platform Stage.       |
| appUid       | <code>\*</code> | The Uid of the Serverless Platform Application.  |
| instanceName | <code>\*</code> | The name of the Serverless Platform Instance.    |

<a name="ServerlessSDK+validateInstance"></a>

### serverlessSDK.validateInstance(instanceToValidate) ⇒ <code>object</code>

Validates the properties of an Instance, as well as auto-corrects shortened syntax (e.g. org => orgName)

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a validated, formatted version of the Instance

| Param              | Type            | Description                                            |
| ------------------ | --------------- | ------------------------------------------------------ |
| instanceToValidate | <code>\*</code> | The Serverless Platform Instance you want to validate. |

<a name="ServerlessSDK+createInstance"></a>

### serverlessSDK.createInstance(orgName, stageName, appName, instanceName) ⇒ <code>object</code>

Returns a new Instance as a Javascript object.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>object</code> - Returns a new Instance definition as a Javascript Object.

| Param        | Type            | Default       | Description                                       |
| ------------ | --------------- | ------------- | ------------------------------------------------- |
| orgName      | <code>\*</code> | <code></code> | The name of the Serverless Platform Organization. |
| stageName    | <code>\*</code> | <code></code> | The name of the Serverless Platform Stage.        |
| appName      | <code>\*</code> | <code></code> | The name of the Serverless Platform Application.  |
| instanceName | <code>\*</code> | <code></code> | The name of the Serverless Platform Instance.     |

<a name="ServerlessSDK+getInstance"></a>

### serverlessSDK.getInstance(orgName, stageName, appName, instanceName)

Get an Instance from the Serverless Platform by it's name and the names of its Organization, Stage, Application.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param        | Type            | Default       | Description                                       |
| ------------ | --------------- | ------------- | ------------------------------------------------- |
| orgName      | <code>\*</code> | <code></code> | The name of the Serverless Platform Organization. |
| stageName    | <code>\*</code> | <code></code> | The name of the Serverless Platform Stage.        |
| appName      | <code>\*</code> | <code></code> | The name of the Serverless Platform Application.  |
| instanceName | <code>\*</code> | <code></code> | The name of the Serverless Platform Instance.     |

<a name="ServerlessSDK+listInstances"></a>

### serverlessSDK.listInstances(orgName, orgUid)

List all Component Instances within an Org, given an org name or org UId

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param   | Type            | Default       | Description                                      |
| ------- | --------------- | ------------- | ------------------------------------------------ |
| orgName | <code>\*</code> | <code></code> | Optional. Must include either orgName or orgUid. |
| orgUid  | <code>\*</code> |               | Optional. Must include either orgName or orgUid. |

<a name="ServerlessSDK+run"></a>

### serverlessSDK.run(action, instanceData, credentials, options)

Run an action on a Component Instance. Is an asynchronous call by default, but you can perform this synchronously if you set `options.sync`. Please note that synchronous runs have a 24 second timeout limit. That is not ideal for long operations, and is not recommended for deployments.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param        | Type            |
| ------------ | --------------- |
| action       | <code>\*</code> |
| instanceData | <code>\*</code> |
| credentials  | <code>\*</code> |
| options      | <code>\*</code> |

<a name="ServerlessSDK+runFinish"></a>

### serverlessSDK.runFinish(method, instanceData)

Run Finish

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param        | Type                | Default           | Description                                      |
| ------------ | ------------------- | ----------------- | ------------------------------------------------ |
| method       | <code>string</code> | <code>null</code> | The action that was performed on the Component.  |
| instanceData | <code>object</code> |                   | An object representing your Instance definition. |

<a name="ServerlessSDK+deploy"></a>

### serverlessSDK.deploy()

Performs a 'deploy' action and polls the 'getInstance' endpoint until its 'instanceStatus' reflects a successful deployment, or error.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
<a name="ServerlessSDK+remove"></a>

### serverlessSDK.remove()

Performs a 'remove' action and polls the 'getInstance' endpoint until its 'instanceStatus' reflects a successful deployment, or error.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
<a name="ServerlessSDK+startInterceptingLogs"></a>

### serverlessSDK.startInterceptingLogs(eventType, context)

Intercepts console 'log' 'debug' and 'error' methods, and sends their data to the Serverless Platform as an Event, before writing to stdout.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)

| Param     | Type            | Default       | Description                                                                 |
| --------- | --------------- | ------------- | --------------------------------------------------------------------------- |
| eventType | <code>\*</code> | <code></code> | Optional. The event name used to publish logs. Defaults to "instance.logs". |
| context   | <code>\*</code> |               | Optional. Additional context added to the published log data.               |

<a name="ServerlessSDK+stopInterceptingLogs"></a>

### serverlessSDK.stopInterceptingLogs()

Stop intercepting console methods

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
<a name="ServerlessSDK+registerWebhook"></a>

### serverlessSDK.registerWebhook(url) ⇒ <code>Promise.&lt;object&gt;</code>

Registers a webhook endpoint to receive Serverless Platform events. Endpoint should be able to receieve JSON formatted event as a HTTP POST payload.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Registered webhook endpoint.

```json
{
  "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
  "object": "webhook_endpoint",
  "url": "https://postb.in/1598300732037-0682672155089",
  "description": "This is my webhook, I like it a lot",
  "filter": {
    "enabled_events": ["*"]
  },
  "status": {
    "disabled": false
  },
  "created": 1593710260258
}
```

| Param                         | Type                | Description                                                                                    |
| ----------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| url                           | <code>string</code> | HTTP webhook endpoint URL.                                                                     |
| options.description           | <code>string</code> | An optional description of what the webhook is used for.                                       |
| options.filter                | <code>object</code> | Optionally, filter which events this endpoint should receive.                                  |
| options.filter.enabled_events | <code>object</code> | The list of events to enable for this endpoint. `["*"]` indicates that all events are enabled. |

<a name="ServerlessSDK+listWebhooks"></a>

### serverlessSDK.listWebhooks() ⇒ <code>Promise.&lt;object&gt;</code>

Lists all regsitered webhook endpoints.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - A dictionary with a `data` property that contains an array, with each entry being a `webhook` object.

```json
{
  "object": "list",
  "data": [
    {
      "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
      "object": "webhook_endpoint",
      "url": "https://postb.in/1598300732037-0682672155089",
      "description": "This is my webhook, I like it a lot",
      "filter": {
        "enabled_events": ["*"]
      },
      "status": {
        "disabled": false,
        "most_recent_delivery": {
          "event_uid": "evt_5cmXN7kqdu5YY69HFKegmiGR",
          "response_status_code": 200,
          "response_headers": {
            "content-length": "12",
            "connection": "close",
            "content-type": "application/json"
          },
          "request_headers": {
            "User-Agent": "Serverless-Webhook/0.1",
            "Content-type": "application/json",
            "X-Serverless-Delivery": "e1701c44-5d92-4515-8bfb-6c9173a89b60",
            "X-Serverless-Event": "test.webhook.send2"
          },
          "response_text": "{\"ok\": true}",
          "error_message": null,
          "timestamp": 1599595612876
        }
      },
      "created": 1599591851267,
      "updated": 1599595613099
    },
    {...},
    {...}
  ]
}
```

| Param                  | Type                | Description                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| options.starting_after | <code>string</code> | A cursor for use in pagination. `starting_after` is a webhook endpoint object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with `whe_foo`, your subsequent call can include `starting_after=whe_foo` in order to fetch the next page of the list. |
| options.limit          | <code>number</code> | A limit on the number of webhook endpoints to be returned. Limit can range between 1 and 100, and the default is 10.                                                                                                                                                                                                  |

<a name="ServerlessSDK+getWebhook"></a>

### serverlessSDK.getWebhook(uid) ⇒ <code>Promise.&lt;object&gt;</code>

Retrieves a webhook endpoint with the given ID.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - A webhook endpoint if a valid webhook endpoint ID was provided.

````json
{
  "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
  "object": "webhook_endpoint",
  "url": "https://postb.in/1598300732037-0682672155089",
  "description": "This is my webhook, I like it a lot",
  "filter": {
    "enabled_events": ["*"]
  },
  "status": {
    "disabled": false,
    "most_recent_delivery": {
      "event_uid": "evt_5cmXN7kqdu5YY69HFKegmiGR",
      "response_status_code": 200,
      "response_headers": {
        "content-length": "12",
        "connection": "close",
        "content-type": "application/json"
      },
      "request_headers": {
        "User-Agent": "Serverless-Webhook/0.1",
        "Content-type": "application/json",
        "X-Serverless-Delivery": "e1701c44-5d92-4515-8bfb-6c9173a89b60",
        "X-Serverless-Event": "test.webhook.send2"
      },
      "response_text": "{\"ok\": true}",
      "error_message": null,
      "timestamp": 1599595612876
    }
  },
  "created": 1599591851267,
  "updated": 1599595613099
}

| Param | Type | Description |
| --- | --- | --- |
| uid | <code>string</code> | Webhook endpoint ID. |

<a name="ServerlessSDK+updateWebhook"></a>

### serverlessSDK.updateWebhook(uid) ⇒ <code>Promise.&lt;object&gt;</code>
Updates the registered webhook endpoint. You may edit the url, description, the list of filters, and the status of your endpoint.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)
**Returns**: <code>Promise.&lt;object&gt;</code> - Updated webhook endpoint.
```json
{
  "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
  "object": "webhook_endpoint",
  "url": "https://postb.in/1598300732037-0682672155089",
  "description": "This is my webhook, I like it a lot",
  "filter": {
    "enabled_events": ["*"]
  },
  "status": {
    "disabled": false
  },
  "created": 1593710260258
}
````

| Param                         | Type                 | Description                                                                                                                |
| ----------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| uid                           | <code>string</code>  | Webhook endpoint ID.                                                                                                       |
| updates.url                   | <code>string</code>  | HTTP webhook endpoint url, if updating.                                                                                    |
| updates.description           | <code>string</code>  | An optional updated description of what the webhook is used for.                                                           |
| updates.filter                | <code>object</code>  | Optionally, update filter which events this endpoint should receive. An existing filter can reset by setting it to `null`. |
| updates.filter.enabled_events | <code>object</code>  | The list of events to enable for this endpoint. `["*"]` indicates that all events are enabled.                             |
| updates.status.disabled       | <code>boolean</code> | Enable/disable the webhook endpoint.                                                                                       |

<a name="ServerlessSDK+deleteWebhook"></a>

### serverlessSDK.deleteWebhook(uid) ⇒ <code>Promise.&lt;object&gt;</code>

Deletes the webhook endpoint with the given ID.

**Kind**: instance method of [<code>ServerlessSDK</code>](#ServerlessSDK)  
**Returns**: <code>Promise.&lt;object&gt;</code> - An object with the deleted webhook endpoints’s ID if a valid webhook endpoint ID was provided. Otherwise, this call throws an error, such as if the webhook endpoint has already been deleted.

```json
{
  "uid": "whk_2y9fUcnZroc8BhMjC26tQdg8",
  "object": "webhook_endpoint",
  "deleted": true
}

| Param | Type | Description |
| --- | --- | --- |
| uid | <code>string</code> | Webhook endpoint ID. |


## Publishing the SDK

Before publishing the SDK, be sure to run the pre-publish script, which browserifies the code and updates its documentation, by running: `npm run pre-publish` within the `sdk` folder.

* * *

&copy; Serverless Inc.
```
