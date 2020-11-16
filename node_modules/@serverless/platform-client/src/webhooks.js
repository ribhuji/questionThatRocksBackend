'use strict';

const querystring = require('querystring');
const utils = require('./utils');

const register = (sdk, url, description, filter) => {
  return utils.request({
    endpoint: `${sdk.getDomain('event-webhooks')}/webhooks`,
    method: 'POST',
    accessKey: sdk.accessKey,
    data: {
      org_uid: sdk.context.orgUid,
      org_name: sdk.context.orgName,
      url,
      description,
      filter,
    },
  });
};

const list = (sdk, startingAfter, limit) => {
  return utils.request({
    endpoint: `${sdk.getDomain('event-webhooks')}/webhooks?${querystring.stringify({
      org_uid: sdk.context.orgUid,
      org_name: sdk.context.orgName,
      starting_after: startingAfter,
      limit,
    })}`,
    method: 'GET',
    accessKey: sdk.accessKey,
  });
};

const get = (sdk, uid) => {
  return utils.request({
    endpoint: `${sdk.getDomain('event-webhooks')}/webhooks/${uid}`,
    method: 'GET',
    accessKey: sdk.accessKey,
  });
};

const update = (sdk, uid, updates) => {
  return utils.request({
    endpoint: `${sdk.getDomain('event-webhooks')}/webhooks/${uid}`,
    method: 'POST',
    data: {
      url: updates.url,
      description: updates.description,
      filter: updates.filter,
      status: updates.status,
    },
    accessKey: sdk.accessKey,
  });
};

const remove = (sdk, uid) => {
  return utils.request({
    endpoint: `${sdk.getDomain('event-webhooks')}/webhooks/${uid}`,
    method: 'DELETE',
    accessKey: sdk.accessKey,
  });
};

module.exports = {
  register,
  list,
  get,
  update,
  remove,
};
