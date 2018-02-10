'use strict';
require('chai').should();
import { Some, None, Option } from './';
import { match, pattern } from '../match';
import Monad from '../monad';

describe('option', function() {
  it('should be constructable as Some', function() {
    new Some(3).should.be.an.instanceof(Option);
  });

  it('should be constructable as None', function() {
    new None().should.be.an.instanceof(Option);
  });

  it('should be compatible with match', function() {
    match(new Some(3)) (
      pattern`None` (() => 'fail'),
      pattern`Some(x)` (({ x }) => x)
    ).should.equal(3)

    match(new None) (
      pattern `None` (() => 'pass'),
      pattern `Some(x)` (() => 'fail')
    ).should.equal('pass')
  })

  it('should be compatible with Monad', function() {
    new Some(3).should.be.an.instanceof(Monad);
    Option.return(3).should.deep.equal(new Some(3));
    new Some(3).bind(x => Option.return(x + 1)).should.deep.equal(new Some(4));
    Option.fail("Bad").should.deep.equal(new None);
  })

  describe('.from', function() {
    it('should create a None or Some from a nullable value', function() {
      Option.from(null).should.be.an.instanceof(None);
      Option.from(undefined).should.be.an.instanceof(None);
      Option.from(3).should.be.an.instanceof(Some);
    });
  });

  describe('#map', function() {
    it('should transform values', function() {
      new Some(3).map(x => x + 1).should.deep.equal(new Some(4));
    });
    it('should do nothing for none', function() {
      new None().map(x => x + 1).should.deep.equal(new None);
    });
  });

  describe('#flatMap', function() {
    it('should transform and flatten values', function() {
      new Some(3).flatMap(x => new Some(x + 1)).should.deep.equal(new Some(4));
      new None().flatMap(x => new None).should.deep.equal(new None);
    });
    it('should do nothing for none', function() {
      new None().flatMap(x => new Some(x + 1)).should.deep.equal(new None);
      new None().flatMap(x => new None).should.deep.equal(new None);
    });
    it('should check that the returned value is actually an option', function() {
      (() => new Some(1).flatMap(x => 4)).should.throw();
    });
  });

  describe('#unwrap', function() {
    it('should return the contained value', function() {
      new Some(3).unwrap().should.equal(3);
    });
    it('should fail when unwrapping a None', function() {
      (() => new None().unwrap()).should.throw();
    });
  });

  describe('#unwrapOr', function() {
    it('should return the contained value', function() {
      new Some(3).unwrapOr(4).should.equal(3);
    });
    it('should return the default value', function() {
      new None().unwrapOr(4).should.equal(4);
    })
  });

  describe('#isNone', function() {
    it('should be false for a some', function() {
      new Some(3).isNone.should.equal(false);
    });
    it('should be true for a none', function() {
      new None().isNone.should.equal(true);
    });
  });

  describe('#isSome', function() {
    it('should be true for a some', function() {
      new Some(3).isSome.should.equal(true);
    });
    it('should be false for a none', function() {
      new None().isSome.  should.equal(false);
    });
  });
});
