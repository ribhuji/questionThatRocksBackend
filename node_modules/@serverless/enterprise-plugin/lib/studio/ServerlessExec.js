'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const path = require('path');

const slsCommand = 'serverless';

const spawn = require('child-process-ext/spawn');

const getDependencies = require('ncjsm/get-dependencies');

const execOptions = {
  env: _objectSpread(_objectSpread({}, process.env), {}, {
    SLS_DEV_MODE: true
  }),
  cwd: process.cwd(),
  stdio: 'inherit'
};

class ServerlessExec {
  constructor(stage, region) {
    this.deployToStage = stage;
    this.deployToRegion = region;
    this.functionToFilenames = {};
  }

  info() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const filenameToFunctions = {};
      const trackedFiles = [];
      let output = {};

      try {
        /**
         * Issue the --info variant of this command to get a parsed JSON output
         * of the serverless.yml to determine HTTP endpoints
         */
        const _yield$spawn = yield spawn(slsCommand, ['studio', '--info', `--stage=${_this.deployToStage}`, `--region=${_this.deployToRegion}`]),
              stdoutBuffer = _yield$spawn.stdoutBuffer;

        output = JSON.parse(stdoutBuffer.toString());
      } catch (e) {
        /**
         * If you ctrl+c during "serverless dev --info" to extract parsed
         * yml information and HTTP endpoints, this will blow up. For now,
         * just return some empty state objects so we can exit cleanly
         * without an error.
         */
        return {
          filenameToFunctions,
          trackedFiles,
          output,
          functions: []
        };
      }

      const _output = output,
            functions = _output.functions;
      /**
       * Use the handler path to reconstruct the path to the entry module
       */

      yield Promise.all(Object.keys(functions).map( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (functionName) {
          const _path$parse = path.parse(functions[functionName].handler),
                dir = _path$parse.dir,
                name = _path$parse.name;

          const handlerEntry = `${path.join(dir, name)}.js`;
          /**
           * Determine modules required by the entry point of the handler
           */

          const list = yield getDependencies(handlerEntry, {
            ignoreMissing: true,
            ignoreExternal: true
          });
          /**
           * Store all files that make up this function
           */

          _this.functionToFilenames[functionName] = list;
          /**
           * For convenience, map all watched modules to function(s)
           */

          list.forEach(watchedFilename => {
            /**
             * Functions already mapped to this file
             */
            const funcs = filenameToFunctions[watchedFilename] || [];
            filenameToFunctions[watchedFilename] = new Set([...funcs, functionName]);
          });
          trackedFiles.push(...list);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()));
      return {
        filenameToFunctions,
        trackedFiles,
        output,
        functions
      };
    })();
  }

  fetchEndpoints() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let endpoints = [];
      /**
       * Close your eyes.
       *
       * Call 'serverless info' here to get the endpoints and pull them out of the output, if there are any.
       */

      let stdoutBuffer;

      try {
        var _yield$spawn2 = yield spawn(slsCommand, ['info', `--stage=${_this2.deployToStage}`, `--region=${_this2.deployToRegion}`]);

        stdoutBuffer = _yield$spawn2.stdoutBuffer;
      } catch (error) {
        /**
         * If we fail, it's probably because this this stage is not
         * yet deployed.
         */
        return endpoints;
      }

      try {
        endpoints = stdoutBuffer.toString().match(/(ANY|GET|POST|PUT|PATCH|HEAD|OPTIONS|DELETE) - (.*)/g).map(stringEndpoint => {
          const _stringEndpoint$split = stringEndpoint.split(' - '),
                _stringEndpoint$split2 = _slicedToArray(_stringEndpoint$split, 2),
                method = _stringEndpoint$split2[0],
                endpoint = _stringEndpoint$split2[1];

          return {
            method,
            endpoint
          };
        });
      } catch (e) {
        console.error('ERROR parsing "serverless info"'); // eslint-disable-line no-console
      }

      return endpoints;
    })();
  }

  deploy(functionName) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const deployArgs = ['deploy', `--stage=${_this3.deployToStage}`, `--region=${_this3.deployToRegion}`];

      if (functionName) {
        deployArgs.splice(1, 0, 'function', `--function=${functionName}`);
      }

      yield spawn(slsCommand, deployArgs, execOptions);
    })();
  }

  remove() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield spawn(slsCommand, ['remove', `--stage=${_this4.deployToStage}`, `--region=${_this4.deployToRegion}`], execOptions);
    })();
  }

  invoke(invokeStudioEvent) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const functionName = invokeStudioEvent.functionName,
            payload = invokeStudioEvent.payload;
      yield spawn(slsCommand, ['invoke', `--stage=${_this5.deployToStage}`, `--region=${_this5.deployToRegion}`, `--function=${functionName}`, `--data=${payload.body}`], execOptions);
    })();
  }

}

module.exports = ServerlessExec;
//# sourceMappingURL=ServerlessExec.js.map