'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const createEvent = require('@serverless/event-mocks').default;

const zlib = require('zlib');

const hasOwnProperty = Object.prototype.hasOwnProperty;

function recordWrapper(event) {
  return {
    Records: [event]
  };
}

function encodeBody(body) {
  if (!body) return body;
  return Buffer.from(body).toString('base64');
}

function gzipBody(_x) {
  return _gzipBody.apply(this, arguments);
}

function _gzipBody() {
  _gzipBody = _asyncToGenerator(function* (body) {
    return new Promise((res, rej) => {
      zlib.gzip(body, (error, result) => {
        if (error) {
          rej(error);
        } else {
          res(result);
        }
      });
    });
  });
  return _gzipBody.apply(this, arguments);
}

function parsedBody(body) {
  return JSON.parse(body);
}

const eventDict = {
  'aws:apiGateway': body => ({
    body
  }),
  'aws:sns': body => recordWrapper({
    Sns: {
      Message: body
    }
  }),
  'aws:sqs': body => recordWrapper({
    body
  }),
  'aws:dynamo': body => recordWrapper({
    dynamodb: body
  }),
  'aws:kinesis': body => recordWrapper({
    kinesis: {
      data: encodeBody(body)
    }
  }),
  'aws:cloudWatchLog': function () {
    var _awsCloudWatchLog = _asyncToGenerator(function* (body) {
      return {
        awslogs: {
          data: encodeBody(yield gzipBody(body))
        }
      };
    });

    function awsCloudWatchLog(_x2) {
      return _awsCloudWatchLog.apply(this, arguments);
    }

    return awsCloudWatchLog;
  }(),
  'aws:s3': () => ({}),
  'aws:alexaSmartHome': body => parsedBody(body),
  'aws:alexaSkill': body => parsedBody(body),
  'aws:cloudWatch': body => parsedBody(body),
  'aws:iot': body => parsedBody(body),
  'aws:cognitoUserPool': body => parsedBody(body),
  'aws:websocket': body => ({
    body
  })
};

function wrapEvent(_x3, _x4) {
  return _wrapEvent.apply(this, arguments);
}

function _wrapEvent() {
  _wrapEvent = _asyncToGenerator(function* (eventType, body) {
    if (hasOwnProperty.call(eventDict, eventType)) {
      return createEvent(eventType, yield eventDict[eventType](body));
    }

    throw new Error('Invalid event specified.');
  });
  return _wrapEvent.apply(this, arguments);
}

const generate = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (ctx) {
    const options = ctx.sls.processedInput.options;
    const body = options.body === undefined ? '{}' : options.body;
    const event = yield wrapEvent(options.type, body); // eslint-disable-next-line no-console

    return console.log(JSON.stringify(event));
  });

  return function generate(_x5) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  generate,
  eventDict
};
//# sourceMappingURL=generateEvent.js.map