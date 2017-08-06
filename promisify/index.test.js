'use strict';
require('chai').use(require('chai-as-promised')).should();

const promisify = require('./');
describe('promisify', function() {
  const good = (value, cb) => setTimeout(() => cb(null, value), 0);
  const bad = (value, cb) => setTimeout(() => cb(new Error()), 0);
  it('should resolve when no errors are passed', function() {
    return promisify(good)(true).should.eventually.equal(true);
  });
  it('should reject when an error is passed', function() {
    return promisify(bad)(true).should.eventually.be.rejected;
  });
  describe('#reverse', function() {
    const good = (value, cb) => setTimeout(() => cb(value), 0);
    const bad = (value, cb) => setTimeout(() => cb(null, new Error()), 0);
    it('should resolve when no errors are passed', function() {
      return promisify.reverse(good)(true).should.eventually.equal(true);
    });
    it('should reject when an error is passed', function() {
      return promisify.reverse(bad)(true).should.eventually.be.rejected;
    });
  });
});
