'use strict';
require('chai').should();

const symbolic = require('./');
describe('symbolic', function() {
  it('should indefinitely generate symbols', function() {
    let [a,,,,,,,,,,b] = symbolic;
    a.should.be.a('symbol');
    b.should.be.a('symbol');
  });
  it('should be an iterator', function() {
    let a = symbolic.next();
    a.value.should.be.a('symbol');
    a.done.should.be.falsey;
  });
});
