'use strict';
require('chai').use(require('chai-as-promised')).should();
const lolex = require('lolex');

const wait = require('./');
describe('wait', function() {
  let clock;
  before(() => clock = lolex.install());
  it('should resolve after the time has passed', function(done) {
    wait(1000).should.eventually.be.fulfilled.notify(done);
    clock.tick(1000);
  });
  describe("#cancel", function() {
    it('should reject the promise', function() {
      return wait(1000).cancel().should.eventually.be.rejected;
    });
  });
  describe("#skip", function() {
    it('should immediately resolve the promise', function() {
      return wait(1000).skip().should.eventually.be.resolved;
    });
  });
  describe("#reset", function() {
    it('should restart the timer', function() {
      let isResolved = false;
      const w = wait(1000);
      w.should.eventually.notify(() => isResolved = true);
      clock.tick(500);
      w.reset();
      clock.tick(500);
      isResolved.should.be.falsey;
      clock.tick(500);
      return w.should.eventually.be.resolved;
    });
  });
  after(() => clock.uninstall());
});
