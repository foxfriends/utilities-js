'use strict';
require('chai').should();

const enumerate = require('./');
describe('enumerate', function() {
  const keys = ['apple', 'orange', 'pear'];
  const fruits = enumerate(...keys);
  it('should generate the enum with the correct keys', function() {
    fruits.apple.should.equal(0);
    fruits.orange.should.equal(1);
    fruits.pear.should.equal(2);
  });
  it('should be iterable', function() {
    [...fruits].should.deep.equal([0, 1, 2]);
  });
  it('should have a length', function() {
    fruits.length.should.equal(3);
  });
  it('should throw if trying to make length a key', function() {
    enumerate.bind(null, 'a', 'b', 'length', 'c').should.throw(Error);
  });
});
