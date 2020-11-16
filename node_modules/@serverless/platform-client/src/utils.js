'use strict';

/**
 * SERVERLESS PLATFORM CLIENT SDK: UTILS
 */

const axios = require('axios');
const traverse = require('traverse');
const minimatch = require('minimatch');

const utils = {};

/**
 * Wait for a number of miliseconds
 * @param {*} wait
 */
const sleep = async (wait) => new Promise((resolve) => setTimeout(() => resolve(), wait));

/**
 * Make HTTP API requests, easily
 * @param {*} options.endpoint
 * @param {*} options.data
 * @param {*} options.accessKey
 * @param {*} options.method
 */
const request = async (options) => {
  const requestOptions = {
    url: options.endpoint,
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: options.data,
  };

  if (options.accessKey) {
    requestOptions.headers.authorization = `Bearer ${options.accessKey}`;
  }

  if (options.headers) {
    requestOptions.headers = { ...requestOptions.headers, ...options.headers };
  }

  try {
    const res = await axios(requestOptions);
    return res.data;
  } catch (error) {
    // Add useful details if they are included in the HTTP response
    if (error.response && error.response.data) {
      const err = new Error(error.response.data.message);
      err.statusCode = error.response.data.statusCode || null;
      err.name = error.response.data.name || null;
      err.details = error.response.data.details || null;
      throw err;
    }

    // otherwise, throw the typical axios error
    throw error;
  }
};

/**
 * Resolves any variables that require resolving before the engine.
 * This currently supports only ${env}.  All others should be resolved within the deployment engine.
 * @param {*} inputs
 */
const resolveInputEnvVariables = (inputs) => {
  const regex = /\${(\w*:?[\w\d.-]+)}/g;
  let variableResolved = false;
  const resolvedInputs = traverse(inputs).forEach(function (value) {
    const matches = typeof value === 'string' ? value.match(regex) : null;
    if (matches) {
      let newValue = value;
      for (const match of matches) {
        // Search for ${env:}
        if (/\${env:(\w*[\w.-_]+)}/g.test(match)) {
          const referencedPropertyPath = match.substring(2, match.length - 1).split(':');
          newValue = process.env[referencedPropertyPath[1]];
          variableResolved = true;
        }
      }
      this.update(newValue);
    }
  });
  if (variableResolved) {
    return resolveInputEnvVariables(resolvedInputs);
  }
  return resolvedInputs;
};

// Add to utils object
utils.sleep = sleep;
utils.request = request;
utils.resolveInputEnvVariables = resolveInputEnvVariables;

/**
 *
 * Only load these Utilies when in a Node.js Environment
 *
 */

if (typeof window === 'undefined') {
  const path = require('path');
  const fs = require('fs');
  const AdmZip = require('adm-zip');
  const { parseUrl } = require('url');
  const https = require('https');
  const HttpsProxyAgent = require('https-proxy-agent');

  const getAgent = () => {
    // Use HTTPS Proxy (Optional)
    const proxy =
      process.env.proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy ||
      process.env.HTTPS_PROXY ||
      process.env.https_proxy;

    const agentOptions = {};
    if (proxy) {
      Object.assign(agentOptions, parseUrl(proxy));
    }

    const ca = process.env.ca || process.env.HTTPS_CA || process.env.https_ca;

    let caCerts = [];

    if (ca) {
      // Can be a single certificate or multiple, comma separated.
      const caArr = ca.split(',');
      // Replace the newline -- https://stackoverflow.com/questions/30400341
      caCerts = caCerts.concat(caArr.map((cert) => cert.replace(/\\n/g, '\n')));
    }

    const cafile = process.env.cafile || process.env.HTTPS_CAFILE || process.env.https_cafile;

    if (cafile) {
      // Can be a single certificate file path or multiple paths, comma separated.
      const caPathArr = cafile.split(',');
      caCerts = caCerts.concat(caPathArr.map((cafilePath) => fs.readFileSync(cafilePath.trim())));
    }

    if (caCerts.length > 0) {
      Object.assign(agentOptions, {
        rejectUnauthorized: true,
        ca: caCerts,
      });
    }

    if (proxy) {
      return new HttpsProxyAgent(agentOptions);
    } else if (agentOptions.ca) {
      return new https.Agent(agentOptions);
    }
    return undefined;
  };

  /**
   * Get the size of a directory
   * @param {string} p path to directory
   */
  const getDirSize = async (p) => {
    const stat = fs.statSync(p);
    if (stat.isFile()) {
      return stat.size;
    } else if (stat.isDirectory()) {
      const entries = fs.readdirSync(p);
      return Promise.all(entries.map((e) => getDirSize(path.join(p, e)))).then((e) =>
        e.reduce((a, c) => a + c, 0)
      );
    }
    return 0;
    // can't take size of a stream/symlink/socket/etc
  };

  /**
   * Zip a file
   * @param {*} inputDirPath
   * @param {*} outputZipPath
   */
  const zip = async (
    inputDirPath = null,
    outputFilePath = null,
    include = [],
    exclude = [],
    includeContent = []
  ) => {
    let format = outputFilePath.split('.');
    format = format[format.length - 1].trim();

    if (!['zip', 'tar'].includes(format)) {
      throw new Error('Please provide a valid format. Either a "zip" or a "tar"');
    }

    const zipper = new AdmZip();

    zipper.addLocalFolder(inputDirPath, null, (itemPath) => {
      for (const excludeItem of exclude) {
        if (minimatch(itemPath, excludeItem, { nocase: true })) {
          return false;
        }
      }
      return true;
    });

    if (include && include.length) {
      include.forEach((filePath) => zipper.addLocalFile(path.resolve(filePath)));
    }

    if (includeContent && includeContent.length) {
      includeContent.forEach((content) =>
        zipper.addFile(
          content.fileName,
          Buffer.alloc(content.fileContent.length, content.fileContent)
        )
      );
    }

    zipper.writeZip(outputFilePath);

    return outputFilePath;
  };

  /**
   * Unzip a zipped file
   * @param {*} zipPath
   */
  const unzip = async (inputZipPath, removeZip) => {
    const destPath = path.join('/tmp', Math.random().toString(36).substring(6));
    const unzipper = new AdmZip(inputZipPath);
    unzipper.extractAllTo(destPath, true);
    // Delete zip file to preserve space on AWS Lambda (it's limited to 250MB)
    if (removeZip) {
      fs.rmdirSync(inputZipPath);
    }
    return destPath;
  };

  /**
   * Checks whether a file exists
   * @param {*} filePath
   */
  const fileExistsSync = (filePath) => {
    try {
      const stats = fs.lstatSync(filePath);
      return stats.isFile();
    } catch (e) {
      return false;
    }
  };

  // Add to utils object
  utils.getAgent = getAgent;
  utils.getDirSize = getDirSize;
  utils.zip = zip;
  utils.unzip = unzip;
  utils.fileExistsSync = fileExistsSync;
}

// Export
module.exports = utils;
