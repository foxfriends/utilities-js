'use strict';
require('chai').should();

const pad = require('./');
describe('pad', function() {
  it('should add characters to the front', function() {
    pad('ello', 'h', 5).should.equal('hello');
  });
  it('should add characters to the end', function() {
    pad('goodby', 'e', 7, true).should.equal('goodbye');
  });
  it('should not affect strings that are already long enough', function() {
    pad('123456', '7', 5).should.equal('123456');
  });
  it('should only use the first character', function() {
    pad('1', '234', 4).should.equal('2221');
  });
});
