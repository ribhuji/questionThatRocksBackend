'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const path = require('path');

const fs = require('fs-extra');

const fileExists = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (filename) {
    try {
      const stat = yield fs.lstat(filename);
      return stat.isFile();
    } catch (error) {
      return false;
    }
  });

  return function fileExists(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = /*#__PURE__*/function () {
  var _getServerlessFilePath = _asyncToGenerator(function* (filename, servicePath) {
    if (filename) {
      const filePath = path.join(servicePath, filename);
      const customExists = yield fileExists(filePath);

      if (!customExists) {
        throw new Error('Could not find serverless service definition file.');
      }

      return filePath;
    }

    const ymlFilePath = path.join(servicePath, 'serverless.yml');
    const yamlFilePath = path.join(servicePath, 'serverless.yaml');
    const jsonFilePath = path.join(servicePath, 'serverless.json');
    const jsFilePath = path.join(servicePath, 'serverless.js');
    const tsFilePath = path.join(servicePath, 'serverless.ts');

    const _yield$Promise$all = yield Promise.all([fileExists(jsonFilePath), fileExists(ymlFilePath), fileExists(yamlFilePath), fileExists(jsFilePath), fileExists(tsFilePath)]),
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 5),
          json = _yield$Promise$all2[0],
          yml = _yield$Promise$all2[1],
          yaml = _yield$Promise$all2[2],
          js = _yield$Promise$all2[3],
          ts = _yield$Promise$all2[4];

    if (yml) {
      return ymlFilePath;
    } else if (yaml) {
      return yamlFilePath;
    } else if (json) {
      return jsonFilePath;
    } else if (js) {
      return jsFilePath;
    } else if (ts) {
      return tsFilePath;
    }

    throw new Error('Could not find any serverless service definition file.');
  });

  function getServerlessFilePath(_x2, _x3) {
    return _getServerlessFilePath.apply(this, arguments);
  }

  return getServerlessFilePath;
}();
//# sourceMappingURL=getServerlessFilePath.js.map