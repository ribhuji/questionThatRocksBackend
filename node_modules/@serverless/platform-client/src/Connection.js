'use strict';

/**
 * Connection
 */

const WS = require('isomorphic-ws');

class Connection {
  constructor(sdk) {
    this.sdk = sdk;
    this.connection = null;
    this.context = {};
  }

  isConnected() {
    return !!this.connection;
  }

  /**
   * Connects to websockets and returns the connection with event handlers .on('open', 'message', 'error')
   */
  async connect(options) {
    const self = this;

    if (options.orgName) {
      this.sdk.context.orgName = options.orgName;
    }
    if (options.orgUid) {
      this.sdk.context.orgUid = options.orgUid;
    }

    // Validate org
    if (!this.sdk.context.orgName && !this.sdk.context.orgUid) {
      throw new Error('You must specify an "orgName" or "orgUid" to connect');
    }

    // Sanitize filter
    options.filter = options.filter || {};
    options.filter.stageName = options.filter.stageName ? options.filter.stageName.trim() : null;
    options.filter.appName = options.filter.appName ? options.filter.appName.trim() : null;
    options.filter.instanceName = options.filter.instanceName
      ? options.filter.instanceName.trim()
      : null;

    // Add data to a query param
    let queryParams = '?';
    queryParams += `accessKey=${this.sdk.accessKey}&`;
    if (this.sdk.context.orgName) {
      queryParams += `orgName=${this.sdk.context.orgName}&`;
    }
    if (this.sdk.context.orgUid) {
      queryParams += `orgUid=${this.sdk.context.orgUid}&`;
    }
    queryParams += `filter=${encodeURIComponent(JSON.stringify(options.filter))}&`;

    // Set domain
    const domain = this.sdk.getDomain('events-streaming') + queryParams;

    // Instantiate websockets library
    this.connection = new WS(domain);

    // Handle message event
    if (options.onEvent) {
      this.connection.onmessage = (message) => {
        message = message && message.data ? message.data : null;
        if (typeof message === 'string') {
          message = JSON.parse(message);
        }
        return options.onEvent(message);
      };
    }

    this.connection.onclose = (closeEvent) => {
      // to learn more about closeEvent, ref:
      // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      if (closeEvent.code === 1001) {
        // if close code is 1001 "Going Away", which is what AWS sends on idle/timeout
        // reconnect again
        return self.connect(options);
      }

      // run onDisconnect hook if provided by the user
      // and move on with a clean disconnect
      if (options.onDisconnect) {
        return options.onDisconnect(closeEvent);
      }
      return null;
    };

    return new Promise((resolve, reject) => {
      // Error handler for errors that don't have an unexpected response
      self.connection.onerror = (error) => {
        return reject(
          new Error(`Unexpected Serverless Platform Streaming Error: ${error.message}`)
        );
      };

      self.connection.onopen = () => {
        return resolve();
      };
    });
  }

  /**
   * Sends data up to the websocket connection
   * @param {*} data
   */
  send(data) {
    this.connection.send(data);
  }

  /**
   * Terminates the websockets connection
   */
  disconnect(code) {
    // close with 1000 close code by default
    if (this.connection) {
      this.connection.close(code || 1000);
      this.connection = null;
    }
  }
}

module.exports = Connection;
