"use strict";

var aFrom          = require("es5-ext/array/from")
  , objForEach     = require("es5-ext/object/for-each")
  , isObject       = require("es5-ext/object/is-object")
  , ensureFunction = require("type/plain-function/ensure")
  , ensureString   = require("type/string/ensure");

module.exports = function (moduleIds, callback) {
	// 1. Validate & resolve input
	if (isObject(moduleIds)) {
		moduleIds = aFrom(moduleIds);
		if (!moduleIds.length) throw new TypeError("Minimum one moduleId is required");
	} else {
		moduleIds = [ensureString(moduleIds)];
	}
	ensureFunction(callback);

	// 2. Cache currently cached module values
	var cache = {};
	moduleIds.forEach(function (moduleId) {
		cache[moduleId] = require.cache[moduleId];
		delete require.cache[moduleId];
	});

	try {
		// 3. Run callback
		return callback();
	} finally {
		// 4. Restore state
		objForEach(cache, function (value, moduleId) {
			if (value) require.cache[moduleId] = value;
			else delete require.cache[moduleId];
		});
	}
};
