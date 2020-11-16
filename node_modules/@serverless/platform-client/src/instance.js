'use strict';

/*
 * SERVERLESS PLATFORM SDK: INSTANCE
 */

const path = require('path');
const fs = require('fs');
const { tmpdir } = require('os');
const axios = require('axios');
const exec = require('child_process').exec;
const utils = require('./utils');

/**
 * Correctly formats an instanceId
 * @param {*} orgUid
 * @param {*} stageName
 * @param {*} appUid
 * @param {*} instanceName
 */
const generateId = (orgUid, stageName, appUid, instanceName) => {
  // Validate
  if (!orgUid || !stageName || !appUid || !instanceName) {
    throw new Error("'orgUid' 'stageName' 'appUid' and 'instanceName' are required");
  }
  return `${orgUid}.${stageName}.${appUid}.${instanceName}`;
};

/**
 * Create a new Instance
 * @param {*} orgName
 * @param {*} stageName
 * @param {*} appName
 * @param {*} instanceName
 */
const create = (orgName = null, stageName = null, appName = null, instanceName = null) => {
  // Validate
  if (!orgName || !stageName || !appName || !instanceName) {
    throw new Error("'orgName' 'stageName' 'appName' and 'instanceName' are required");
  }

  // Instance
  const instance = {};
  instance.orgName = orgName;
  instance.appName = appName;
  instance.stageName = stageName;
  instance.instanceName = instanceName;
  instance.componentName = null;
  instance.componentVersion = null;
  instance.inputs = {};
  instance.outputs = {};
  instance.state = {};
  instance.description = null;
  // Status
  instance.instanceStatus = 'inactive';
  instance.deploymentError = null;
  instance.deploymentErrorStack = null;
  instance.lastAction = null;
  // Dates
  instance.createdAt = Date.now();
  instance.updatedAt = Date.now();
  instance.lastDeployedAt = null;
  instance.lastActionAt = null;
  // Metrics
  instance.instanceMetrics = {};
  instance.instanceMetrics.actions = 0;
  instance.instanceMetrics.deployments = 0;
  instance.instanceMetrics.removes = 0;
  instance.instanceMetrics.errors = 0;

  return instance;
};

/**
 * Validates and (re)formats the component instance properties
 */
const validateAndFormat = (rawInstance) => {
  // Copy input object, otherwise the inputter will have unintended data modifications
  const instance = Object.assign({}, rawInstance);

  // Format Helper - If shortened properties are used, replace them with full properties
  if (instance.org) {
    instance.orgName = instance.org;
    delete instance.org;
  }
  if (instance.stage) {
    instance.stageName = instance.stage;
    delete instance.stage;
  }
  if (instance.app) {
    instance.appName = instance.app;
    delete instance.app;
  }
  if (instance.name) {
    instance.instanceName = instance.name;
    delete instance.name;
  }

  // Ensure all required properties exist
  if (!instance.orgName || !instance.stageName || !instance.appName || !instance.instanceName) {
    throw new Error("'orgName' 'stageName' 'appName' and 'instanceName' are required");
  }

  // Format - If shortened component syntax is used, expand into full syntax
  if (instance.component) {
    instance.componentName = instance.component.includes('@')
      ? instance.component.split('@')[0]
      : instance.component;
    instance.componentVersion = instance.component.includes('@')
      ? instance.component.split('@')[1]
      : '';
    delete instance.component;
  }

  // Ensure all required component properties exist
  if (!instance.componentName) {
    throw new Error("'componentName' is required");
  }

  // Ensure an inputs object exists
  if (!instance.inputs) {
    instance.inputs = {};
  }

  return instance;
};

/**
 * Create or update an Instance
 */
const save = async (sdk, instance = {}) => {
  // Validate
  instance = validateAndFormat(instance);

  // Send request
  return utils.request({
    endpoint: `${sdk.getDomain('engine')}/saveInstance`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      instance,
    },
  });
};

/**
 * Get an Instance record by name
 */
const getByName = async (
  sdk,
  orgName = null,
  stageName = null,
  appName = null,
  instanceName = null
) => {
  return utils.request({
    endpoint: `${sdk.getDomain('engine')}/getInstance`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      orgName,
      appName,
      stageName,
      instanceName,
    },
  });
};

/**
 * List Instance records by Org
 */
const listByOrgName = async (sdk, orgName = null, orgUid = null) => {
  return utils.request({
    endpoint: `${sdk.getDomain('engine')}/listInstances`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      orgName,
      orgUid,
    },
  });
};

/*
 * Run a "src" hook, if one is specified
 */
const preRunSrcHook = async (src) => {
  if (typeof src === 'object' && src.hook && src.dist) {
    // First run the build hook, if "hook" and "dist" are specified
    const options = { cwd: src.src };
    return new Promise((resolve, reject) => {
      exec(src.hook, options, (err) => {
        if (err) {
          return reject(
            new Error(`Failed running "src.hook": "${src.hook}" due to the following error: "${err.stderr}"
        ${err.stdout}`)
          );
        }
        return resolve(src.dist);
      });
    });
  } else if (typeof src === 'object' && src.src) {
    src = path.resolve(src.src);
  } else if (typeof src === 'string') {
    src = path.resolve(src);
  }
  return src;
};

/*
 * Uploads the component instance src input reference if available
 */
const preRunSrcUpload = async (sdk, orgName, inputs) => {
  const packagePath = path.join(tmpdir(), `${Math.random().toString(36).substring(6)}.zip`);
  const { srcOriginal } = inputs;
  let { src } = inputs;
  let exclude = [];
  if (typeof srcOriginal === 'object' && srcOriginal.exclude) {
    exclude = srcOriginal.exclude;
  }

  // Get the package signed urls. This is an object includes both the upload and download urls
  // the upload url is used to upload the package to s3
  // while the download url is passed to the component instannce to be downnloaded in the lambda runtime
  const packageUrls = await utils.request({
    endpoint: `${sdk.getDomain('engine')}/getUploadUrls`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      orgName,
    },
  });

  // Zip source
  await utils.zip(src, packagePath, [], exclude);

  // Create a new axios instance and make sure we clear the default axios headers
  // as they cause a mismatch with the signature provided by aws
  const request = axios.create();
  request.defaults.headers.common = {};
  request.defaults.headers.put = {};
  const body = fs.readFileSync(packagePath);

  // Make sure axios handles large packages
  const config = {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  };

  await request.put(packageUrls.upload, body, config);

  // replace the src input to point to the download url so that it's download in the lambda runtime
  src = packageUrls.download;
  return src;
};

/**
 * Run a method. "inputs" override serverless.yml inputs and should only be provided when using custom methods.
 */
const run = async (sdk, method = {}, instanceData = {}, credentials = {}, options = {}) => {
  let instance = JSON.parse(JSON.stringify(instanceData));

  // Validate method
  if (!method) {
    throw new Error('A "method" argument is required');
  }

  // Validate instance
  instance = validateAndFormat(instance);

  // Run source hook and upload source, if "src" input is used...
  let size;
  if (instance.inputs.src) {
    let p = instance.inputs.src;
    if (typeof p !== 'string' && p.dist) {
      p = p.dist;
    } else if (typeof p !== 'string' && p.src) {
      p = p.src;
    }

    // Save original src to present neatly in Dashboard/clients, or this will be replaced by the S3 location by the functions below
    if (instance.inputs.src) {
      instance.inputs.srcOriginal = JSON.parse(JSON.stringify(instance.inputs.src));
    }

    // Process source code, or skip if not provided...
    instance.inputs.src = await preRunSrcHook(instance.inputs.src);

    // Check to ensure the "inputs.src" dir size does not exceed 100MB
    // This must run after the hook because the developer may be creating a separate dir which is stored in "inputs.dist"
    size = await utils.getDirSize(p);

    // Block deployment of code size greater than 200MB
    if (size > 200000000) {
      throw new Error(
        'Your code size must be less than 200MB.  Try using Webpack, Parcel, or AWS Lambda layers to reduce your code size.'
      );
    }

    // Upload the "inputs.src" code
    instance.inputs.src = await preRunSrcUpload(sdk, instance.orgName, instance.inputs);
  }

  return utils.request({
    endpoint: `${sdk.getDomain('engine')}/run`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      method,
      instance,
      credentials,
      options,
      size,
    },
  });
};

/**
 * Finish a run
 */
const runFinish = async (sdk, method = null, instance = {}) => {
  return utils.request({
    endpoint: `${sdk.getDomain('engine')}/runFinish`,
    accessKey: sdk.accessKey,
    method: 'POST',
    data: {
      method,
      instance,
    },
  });
};

/**
 * Run a deployment
 * @param {object} instance The Instance definition.
 * @param {object} credentials The credentials of the cloud providers required by the Instance.
 * @param {object} options Any options you wish to supply the Instance method.
 * @param {number} size The size in bytes of the source code, so that the Instance method can validate it beforehand.
 */
const deploy = async (sdk, instance, credentials, options) => {
  // Set defaults
  options.timeout = options.timeout || 240000; // 240000 = 4 minutes
  options.interval = options.interval || 500;

  // Set timer
  const startedAt = Date.now();

  // Perform Run
  await run(sdk, 'deploy', instance, credentials, options);

  // Set up polling
  // Poll function calls the instance constantly to check its status
  const poll = async () => {
    // Check if timed out
    if (Date.now() - options.timeout > startedAt) {
      throw new Error(`Request timed out after ${options.timeout / 60000} minutes`);
    }

    // Fetch instance
    let instanceRecord = await getByName(
      sdk,
      instance.orgName || instance.org,
      instance.stageName || instance.stage,
      instance.appName || instance.app,
      instance.instanceName || instance.name
    );
    instanceRecord = instanceRecord.instance;

    // Sleep before calling again
    if (instanceRecord.instanceStatus === 'active') {
      return instanceRecord;
    } else if (instanceRecord.instanceStatus === 'error') {
      const error = new Error(instanceRecord.deploymentError);
      error.stack = instanceRecord.deploymentErrorStack;
      throw error;
    }
    await utils.sleep(options.interval);
    return poll();
  };

  return poll();
};

/**
 * Run a removal
 * @param {object} instance The Instance definition.
 * @param {object} credentials The credentials of the cloud providers required by the Instance.
 * @param {object} options Any options you wish to supply the Instance method.
 * @param {number} size The size in bytes of the source code, so that the Instance method can validate it beforehand.
 */
const remove = async (sdk, instance, credentials, options) => {
  // Set defaults
  options.timeout = options.timeout || 60000;
  options.interval = options.interval || 500;

  // Set timer
  const startedAt = Date.now();

  // Perform Run
  await run(sdk, 'remove', instance, credentials, options);

  // Set up polling
  // Poll function calls the instance constantly to check its status
  const poll = async () => {
    // Check if timed out
    if (Date.now() - options.timeout > startedAt) {
      throw new Error(`Request timed out after ${options.timeout / 1000} seconds`);
    }

    // Fetch instance
    let instanceRecord = await getByName(
      sdk,
      instance.orgName || instance.org,
      instance.stageName || instance.stage,
      instance.appName || instance.app,
      instance.instanceName || instance.name
    );
    instanceRecord = instanceRecord.instance;

    // Sleep before calling again
    if (instanceRecord.instanceStatus === 'inactive') {
      return instanceRecord;
    } else if (instanceRecord.instanceStatus === 'error') {
      const error = new Error(instanceRecord.deploymentError);
      error.stack = instanceRecord.deploymentErrorStack;
      throw error;
    }
    await utils.sleep(options.interval);
    return poll();
  };

  return poll();
};

module.exports = {
  generateId,
  validateAndFormat,
  create,
  save,
  getByName,
  listByOrgName,
  run,
  runFinish,
  deploy,
  remove,
};
