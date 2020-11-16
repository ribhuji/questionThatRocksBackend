'use strict';

var fs = require('fs');
var path = require('path');

var objectAssign = require('object-assign');
var parseString = require('xml2js').parseString;

require('native-promise-only');

/**
 * Convert an XML file to JSON.
 *
 * @param {string} filePath - the file path to your XML file
 * @param {object} xml2JsOptions - the xml2js options you want to use
 * @returns {Promise}
 */
module.exports.xmlFileToJSON = function (filePath, xml2JsOptions) {
	xml2JsOptions = objectAssign({}, xml2JsOptions);
	return new Promise(function (resolve, reject) {
		fs.readFile(path.resolve(filePath), 'utf8', function (err, data) {
			if (err) {
				reject(err);
			} else {
				parseString(data, xml2JsOptions, function (err, result) {
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			}
		});
	});
};

/**
 * Convert raw XML data to JSON.
 * @param {string} xmlData - the raw XML data you want to convert
 * @param {object} xml2JsOptions - the xml2js options you want to use
 * @returns {Promise}
 */
module.exports.xmlDataToJSON = function (xmlData, xml2JsOptions) {
	xml2JsOptions = objectAssign({}, xml2JsOptions);

	return new Promise(function (resolve, reject) {
		parseString(xmlData, xml2JsOptions, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
};
