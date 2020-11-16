'use strict';

const utils = require('./utils');

class Eventer {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Validate a publish event(s) request
   * @param {*} events
   */
  validate(events) {
    if (!events) {
      throw new Error('An "event" is required');
    }
    if (typeof events !== 'object') {
      throw new Error('The "event" argument must be an object');
    }

    const validEvent = (event) => {
      if (!event.event || typeof event.event !== 'string') {
        throw new Error(
          'The "event" property containing the event type is required and must be a string'
        );
      }
    };

    if (Array.isArray(events)) {
      if (!events.length) {
        throw new Error('Event batch must be non empty');
      }

      let orgUid;
      let orgName;

      events.forEach((event) => {
        validEvent(event);
        if (
          orgUid &&
          (event.org_uid || event.orgUid) &&
          orgUid !== (event.org_uid || event.orgUid)
        ) {
          throw new Error('All events in batch must belong to the same org uid');
        }
        if (
          orgName &&
          (event.org_name || event.orgName) &&
          orgName !== (event.org_name || event.orgName)
        ) {
          throw new Error('All events in batch must belong to the same org name');
        }
        orgUid = event.org_uid || event.orgUid || orgUid;
        orgName = event.org_name || event.orgName || orgName;
      });

      if (orgUid) {
        events[0].orgUid = events[0].org_uid = orgUid;
      }
      if (orgName) {
        events[0].orgName = events[0].org_name = orgName;
      }
    } else {
      validEvent(events);
    }
    return events;
  }

  /**
   * Convert to a safe Serverless Platform Event
   * @param {*} events
   */
  transform(events) {
    const safeEvent = (event) => ({
      event: event.event.trim(),
      stage_name: event.stage_name || event.stageName,
      app_name: event.app_name || event.appName,
      instance_name: event.instance_name || event.instanceName,
      component_name: event.component_name || event.componentName,
      component_version: event.component_version || event.componentVersion,
      data: event.data || {},
      created: event.created || Date.now(),
    });

    let transformed;
    if (Array.isArray(events)) {
      const safe = safeEvent({
        event: 'batch',
        data: events.map((event) => safeEvent(event)),
      });
      // Set batch metadata from sdk context (overridden by individual event metadata, if any)
      transformed = {
        ...safe,
        org_uid: events[0].orgUid || this.sdk.context.orgUid,
        org_name: events[0].orgName || this.sdk.context.orgName,
        stage_name: this.sdk.context.stageName,
        app_name: this.sdk.context.appName,
        instance_name: this.sdk.context.instanceName,
        component_name: this.sdk.context.componentName,
        component_version: this.sdk.context.componentVersion,
      };
    } else {
      const safe = safeEvent(events);
      // Add missing metdata from sdk context if required
      transformed = {
        ...safe,
        org_uid: events.org_uid || events.orgUid || this.sdk.context.orgUid,
        org_name: events.org_name || events.orgName || this.sdk.context.orgName,
        stage_name: safe.stage_name || this.sdk.context.stageName,
        app_name: safe.app_name || this.sdk.context.appName,
        instance_name: safe.instance_name || this.sdk.context.instanceName,
        component_name: safe.component_name || this.sdk.context.componentName,
        component_version: safe.component_version || this.sdk.context.componentVersion,
      };
    }

    if (!transformed.org_name && !transformed.org_uid) {
      throw new Error('Both event and SDK context are missing an org uid or name');
    }
    return {
      ...transformed,
      access_key: this.sdk.accessKey,
    };
  }

  /**
   * Send an event via the Websockets connection.
   * @param {*} event
   */
  send(event) {
    const safeEvent = this.transform(this.validate(event));
    if (!this.sdk.isConnected()) {
      throw new Error('You are not currently connected to the Serverless Platform.');
    }
    this.sdk.connection.send(JSON.stringify(safeEvent));
  }

  request(api, method = 'GET', data) {
    return utils.request({
      endpoint: `${this.sdk.getDomain('events')}${api}`,
      accessKey: this.sdk.accessKey,
      method,
      data,
    });
  }

  /**
   * Publish event(s) synchornously, via the HTTP API
   * @param {*} events
   */
  publish(events) {
    const safeEvents = this.transform(this.validate(events));
    return this.request('/publish', 'POST', safeEvents);
  }

  /**
   * Retrieve a Serverless Platform Event synchronously via HTTP API.
   * @param {string} eventUid UID of event to be fetched
   */
  getEvent(eventUid) {
    return this.request(`/events/${eventUid}`);
  }

  /**
   * Retrieve a Serverless Platform Event synchronously via HTTP API.
   * @param {Object} options List options
   */
  listEvents(options) {
    const {
      org_name: orgName = null,
      org_uid: orgUid = null,
      event = '*',
      limit = 10,
      created,
      starting_after: startingAfter,
    } = options || {};

    const params = new URLSearchParams({ event, limit });

    if (orgUid) {
      params.append('org_uid', orgUid);
    } else if (orgName) {
      params.append('org_name', orgName);
    } else if (this.sdk.context.orgUid) {
      params.append('org_uid', this.sdk.context.orgUid);
    } else if (this.sdk.context.orgName) {
      params.append('org_name', this.sdk.context.orgName);
    }

    if (created) {
      if (new Set(['number', 'string']).has(typeof created)) {
        params.append('created.gt', created);
      } else if (typeof event !== 'object') {
        let valid = false;
        for (const comparator of ['gt', 'gte', 'lt', 'lte']) {
          if (created[comparator]) {
            params.append(`created.${comparator}`, created[comparator]);
            valid = true;
            break;
          }
        }
        if (!valid) {
          throw new Error(
            "The 'created' dictionary parameter must have one of [gt|gte|lt|lte] set"
          );
        }
      } else {
        throw new Error(
          "The 'created' parameter must be either a integer Unix timestamp or a dictionary"
        );
      }
    }

    if (startingAfter) {
      params.append('starting_after', startingAfter);
    }

    const endpoint = `/events?${params.toString()}`;
    return this.request(endpoint);
  }
}

module.exports = Eventer;
