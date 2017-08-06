'use strict';
require('chai').should();

const getDirectories = require('./');
describe('getDirectories', function() {
  it('should find all directories', function() {
    getDirectories(__dirname + '/test').should.deep.equal(['1', '2', '3']);
  });
});
