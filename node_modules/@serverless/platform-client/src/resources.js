'use strict';

/*
 * SERVERLESS PLATFORM SDK: RESOURCES
 */

const utils = require('./utils');

/**
 * Get the Serverless Platform User Account
 */
const getUser = async (sdk) => {
  const endpoint = `${sdk.getDomain('core')}/core/me`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Get the Serverless Platform User Account Meta information
 */
const getUserMeta = async (sdk) => {
  const endpoint = `${sdk.getDomain('core')}/core/users/meta`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Create/Update the Serverless Platform User Account Meta information
 */
const saveUserMeta = async (sdk, newMeta = {}) => {
  const existingMeta = await getUserMeta(sdk);

  newMeta = Object.assign(existingMeta || {}, newMeta);

  const endpoint = `${sdk.getDomain('core')}/core/users/meta`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: newMeta,
  });
};

/**
 * Validate User and Organization name
 */
const validateUserAndOrgName = async (sdk, userAndOrgName) => {
  const endpoint = `${sdk.getDomain('core')}/core/validate/tenants`;

  const res = await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: {
      ownerUserName: userAndOrgName,
      title: userAndOrgName,
      tenantName: userAndOrgName,
    },
  });

  if (res && res.validationErrors && res.validationErrors.length) {
    return res.validationErrors;
  }

  return null;
};

/**
 * Create Organization
 */
const createOrg = async (sdk, userAndOrgName) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: {
      ownerUserName: userAndOrgName,
      title: userAndOrgName,
      tenantName: userAndOrgName,
    },
  });
};

/**
 * Create a User and Organization
 */
const createUserAndOrg = async (sdk, userAndOrgName) => {
  return await createOrg(sdk, userAndOrgName);
};

/**
 * Get Organization By Name
 */
const getOrgByName = async (sdk, orgName) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants/${orgName}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * List Organizations By User
 */
const listOrgs = async (sdk, username) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants?userName=${username}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Create An Application
 */
const createApp = async (sdk, orgName = null, app = {}) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants/${orgName}/applications`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: {
      tenantName: orgName,
      appName: app.name,
      title: app.name,
      description: app.description,
      deploymentProfiles: app.deploymentProfiles,
    },
  });
};

/**
 * Update An Application
 */
const updateApp = async (sdk, orgName = null, app = {}) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants/${orgName}/applications/${app.name}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'PATCH',
    data: {
      appName: app.name,
      title: app.name,
      description: app.description,
      deploymentProfiles: app.deploymentProfiles,
    },
  });
};

/**
 * Delete An Application
 */
const deleteApp = async (sdk, orgName = null, appName = null) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants/${orgName}/applications/${appName}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'DELETE',
  });
};

/**
 * List Applications in an Organization
 */
const listApps = async (sdk, orgName = null) => {
  const endpoint = `${sdk.getDomain('core')}/core/tenants/${orgName}/applications`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Create initToken for a tenant/user pair
 *
 * @param {*} sdk
 * @param {*} orgName
 * @param {*} data
 */
const createInitToken = async (sdk, orgName = null, data) => {
  const endpoint = `${sdk.getDomain('core')}/core/initTokens`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: {
      tenantName: orgName,
      ...data,
    },
  });
};

/**
 * Fetch initToken by ID
 *
 * @param {*} sdk
 * @param {*} tokenUid
 */
const getInitToken = async (sdk, tokenUid) => {
  const endpoint = `${sdk.getDomain('core')}/core/initTokens/${tokenUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Get providers by Org
 *
 * @param {*} sdk
 * @param {*} orgUid
 */
const getProviders = async (sdk, orgUid) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/providers`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Create a Provider
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} data
 */
const createProvider = async (sdk, orgUid, data) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/providers`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data,
  });
};

/**
 * Get a Provider
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} providerUid
 */
const getProvider = async (sdk, orgUid, providerUid) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/providers/${providerUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Update a Provider
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} providerUid
 * @param {*} data
 */
const updateProvider = async (sdk, orgUid, providerUid, data) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/providers/${providerUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'PUT',
    data,
  });
};

/**
 * Delete a Provider
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} providerUid
 */
const deleteProvider = async (sdk, orgUid, providerUid) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/providers/${providerUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'DELETE',
  });
};

/**
 * Create a providerLink
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} linkType
 * @param {*} linkUid
 * @param {*} providerUid
 */
const createProviderLink = async (sdk, orgUid, linkType, linkUid, providerUid) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/${linkType}s/${linkUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'POST',
    data: {
      providerUid,
    },
  });
};

/**
 * Destroy a providerLink
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} linkType
 * @param {*} linkUid
 */
const deleteProviderLink = async (sdk, orgUid, linkType, linkUid, providerUid) => {
  const endpoint = `${sdk.getDomain(
    'providers'
  )}/orgs/${orgUid}/${linkType}s/${linkUid}/providers/${providerUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'DELETE',
  });
};

/**
 * Get providers by Link
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} linkType
 * @param {*} linkUid
 */
const getProvidersByLink = async (sdk, orgUid, linkType, linkUid) => {
  const endpoint = `${sdk.getDomain('providers')}/orgs/${orgUid}/${linkType}s/${linkUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

/**
 * Get providers by Org, Service, and Instance
 *
 * @param {*} sdk
 * @param {*} orgUid
 * @param {*} serviceUid
 * @param {*} instanceUid
 */
const getProvidersByOrgServiceInstance = async (sdk, orgUid, serviceUid, instanceUid) => {
  const endpoint = `${sdk.getDomain(
    'providers'
  )}/orgs/${orgUid}/services/${serviceUid}/instances/${instanceUid}`;

  return await utils.request({
    accessKey: sdk.accessKey,
    endpoint,
    method: 'GET',
  });
};

module.exports = {
  getUser,
  getUserMeta,
  saveUserMeta,
  validateUserAndOrgName,
  createUserAndOrg,
  createOrg,
  getOrgByName,
  listOrgs,
  createApp,
  updateApp,
  deleteApp,
  listApps,
  createInitToken,
  getInitToken,
  getProviders,
  getProvider,
  getProvidersByOrgServiceInstance,
  createProvider,
  updateProvider,
  deleteProvider,
  createProviderLink,
  deleteProviderLink,
  getProvidersByLink,
};
