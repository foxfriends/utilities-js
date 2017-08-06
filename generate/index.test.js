'use strict';
require('chai').use(require('chai-as-promised')).should();

const generate = require('./');
describe('generate', function() {
  it('should run the generator', function() {
    return generate(function*() {
      yield Promise.resolve();
      yield Promise.resolve();
      return true;
    }).should.eventually.equal(true);
  });
  it('should be able to recover after throwing', function() {
    return generate(function*() {
      try {
        yield Promise.reject();
      } catch(_) {
        return true;
      }
    }).should.eventually.equal(true);
  });
  it('should take in arguments', function() {
    return generate(function*(a, b) {
      a.should.equal(1);
      return b;
    }, null, 1, 2).should.eventually.equal(2);
  });
  it('should pass a "this" argument', function() {
    return generate(function*(a) {
      return this.x + a;
    }, { x: 15 }, 5).should.eventually.equal(20);
  });
  it('should accept yielded values that are not Promises', function() {
    return generate(function*() {
      let x = yield 3;
      x.should.equal(3);
      x = yield {hello: 'world'};
      x.should.deep.equal({hello: 'world'});
      return true;
    }).should.eventually.equal(true);
  });
  describe('should return a promise that', function() {
    it('resolves with the final value when successful', function() {
      return generate(function*() { return true; }).should.eventually.equal(true);
    });
    it('rejects when not successful', function() {
      return generate(function*() { throw new Error(); }).should.eventually.be.rejected;
    });
  });
});
