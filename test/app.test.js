const assert = require('chai').assert;

const data = ['John', 'Doe', 25, '123 John Doe Street'];

describe('Initial Test', function() {
  describe('Array of values test', function() {
    it('should be as initialized', function() {
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 4);
    });
  });
});
