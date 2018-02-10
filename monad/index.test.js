require('chai').should();
const Monad = require('./');

describe('monad', function() {
  it('should provide a default implementation of fail', function() {
    (() => Monad.fail(new Error("The error"))).should.throw("The error");
  });

  it('should provide a default implementation of fail', function() {
    (() => Monad.return(3)).should.throw("Unimplemented");
  });

  it('should require an implementation of bind', function() {
    (() => new Monad().bind(() => 0)).should.throw("Unimplemented");
  });
});
