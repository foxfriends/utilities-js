require('chai').should()
const compose = require('./');

describe('compose', function() {
  it('should compose two functions', function() {
    const plus1 = x => x + 1;
    const times3 = x => x * 3;
    compose(plus1, times3)(1).should.equal(4);
  });
});
