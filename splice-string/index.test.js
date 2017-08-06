'use strict';
require('chai').use(require('chai-as-promised')).should();

const spliceString = require('./');
describe('spliceString', function() {
  it('should remove the section of the string', function() {
    spliceString('hello world', 0, 5).should.equal(' world');
  });
  it('should start from the end of the string', function() {
    spliceString('hello world', -5, 5).should.equal('hello ');
  });
  it('should remove up to the end of the string', function() {
    spliceString('hello world', 5).should.equal('hello');
  });
  it('should insert the values in the space', function() {
    spliceString('hello world', 0, 5, 'goodbye').should.equal('goodbye world');
  });
  it('should insert multiple values in the space', function() {
    spliceString('hello world', 6, 5, 'how', ' are', ' you').should.equal('hello how are you');
  });
});
