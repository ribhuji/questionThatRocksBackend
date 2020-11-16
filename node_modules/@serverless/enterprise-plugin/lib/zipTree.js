'use strict'; // mostly copied from https://github.com/UnitedIncome/serverless-python-requirements/blob/master/lib/zipTree.js
// modified to use native promises and fs-extra's promise support and use import/export

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const fs = require('fs-extra');

const path = require('path');
/**
 * Add a directory recursively to a zip file. Files in src will be added to the top folder of zip.
 * @param {JSZip} zip a zip object in the folder you want to add files to.
 * @param {string} src the source folder.
 * @return {Promise} a promise offering the original JSZip object.
 */


module.exports.addTree = /*#__PURE__*/function () {
  var _self = _asyncToGenerator(function* (zip, src) {
    const srcN = path.normalize(src);
    const contents = yield fs.readdir(srcN);
    yield Promise.all(contents.map(name => {
      const srcPath = path.join(srcN, name);
      return fs.stat(srcPath).then(stat => {
        if (stat.isDirectory()) {
          return self(zip.folder(name), srcPath);
        }

        const opts = {
          date: 0,
          unixPermissions: stat.mode
        };
        return fs.readFile(srcPath).then(data => zip.file(srcPath, data, opts));
      });
    }));
    return zip; // Original zip for chaining.
  });

  function self(_x, _x2) {
    return _self.apply(this, arguments);
  }

  return self;
}();
/**
 * Write zip contents to a file.
 * @param {JSZip} zip the zip object
 * @param {string} targetPath path to write the zip file to.
 * @return {Promise} a promise resolving to null.
 */


module.exports.writeZip = (zip, targetPath) => new Promise(resolve => zip.generateNodeStream({
  platform: process.platform === 'win32' ? 'DOS' : 'UNIX',
  compression: 'deflate',
  compressionOptions: {
    level: 9
  }
}).pipe(fs.createWriteStream(targetPath)).on('finish', resolve));
//# sourceMappingURL=zipTree.js.map