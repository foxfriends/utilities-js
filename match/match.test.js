'use strict';
require('chai').should();
import { Extractor, data, match, pattern, MatchError, PatternError } from './index';

describe('match', function() {
  @data() class Cons { constructor(first, rest) {} }
  @data() class Empty {}

  @data() class Person {
    constructor(name, age) {
      this.name = name;
      this.age = age;
    }
    static [Extractor] (inst) {
      return [inst.age, inst.name];
    }
  }
  @data('Cat($2, $1)') class Animal { constructor(name, breed) {} }

  it('should work with a successful match', function() {
    const cons = new Cons('hello', 'world');

    match(cons) (
      pattern `Cons(a, b)` (({ a, b }) => `${a} ${b}`),
    ).should.equal('hello world');
  });

  it('should throw a MatchError if there is no matching case', function() {
    const cons = new Cons('hello', 'world');
    (() => match(cons) ()).should.throw(MatchError, 'exhaustive');
  });

  it('should produce the first matching case if many are valid', function() {
    const cons = new Cons('hello', 'world');
    match(cons) (
      pattern `Empty` (() => 'fail'),
      pattern `Cons(a, b)` (({ a, b }) => `${a} ${b}`),
      pattern `Cons(a, b)` (() => 'fail'),
    ).should.equal('hello world');
  });

  it('should use a custom extractor', function() {
    const person = new Person('Dave', 9);
    match(person) (
      pattern `Cons(a, b)` (() => 'fail'),
      pattern `Person(age, name)` (({ age, name }) => `${name} is ${age}`),
    ).should.equal('Dave is 9');
  });

  it('should use a custom pattern', function() {
    const cat = new Animal('Dave', 'tabby');
    match(cat) (
      pattern `Animal(a, b)` (() => 'fail'),
      pattern `Cat(breed, name)` (({ name, breed }) => `${name} is a ${breed}`),
    ).should.equal('Dave is a tabby');
  });

  it('should support nested patterns', function() {
    const list = new Cons('first', new Cons('second', 'third'));
    match(list) (
      pattern `Cons(first, Cons(second, third))` (({ first, second, third }) => `${first} ${second} ${third}`),
    ).should.equal('first second third');
  });

  it('should match the correct nested pattern', function() {
    const list = new Cons('first', new Cons('second', new Empty));
    match(list) (
      pattern `Cons(first, Empty)` (() => 'fail 1'),
      pattern `Cons(first, Cons(second, Cons(third, Empty)))` (() => 'fail 2'),
      pattern `Cons(first, Cons(second, Empty))` (({ first, second }) => `${first} ${second}`),
      pattern `Cons(first, rest)` (() => 'fail 3'),
    ).should.equal('first second');
  });

  it('should let * be a non-matching wildcard', function() {
    const cons = new Cons('hello', 'world');
    match(cons) (
      pattern `Cons(*, second)` (x => x),
    ).should.deep.equal({second: 'world'});
  });

  it('should match JSON values prefixed with = as non-matching literal values', function() {
    const cons = new Cons(1, 2);
    match(cons) (
      pattern `Cons(1, 2)` ((obj) => `${obj[1]}, ${obj[2]}`),
    ).should.equal('1, 2');
    match(cons) (
      pattern `Cons(="a", b)` (() => 'fail 1'),
      pattern `Cons(=2, b)` (() => 'fail 2'),
      pattern `Cons(=1, b)` (({ b }) => b),
    ).should.equal(2);
  });

  it('should match JSON objects and arrays deeply', function() {
    const cons = new Cons({a: { b: 1 }}, { c: { d: 2 }});
    match(cons) (
      pattern `Cons(={ "a": { "b": 1 } }, b)` (({b: { c: { d }}}) => d),
    ).should.equal(2);
  });

  it('should throw a MatchError when the JSON after an = is invalid', function() {
    const cons = new Cons(1, 2);
    (() => match(cons) (
      pattern `Cons(=a, b)` ((obj) => `${obj[1]}, ${obj[2]}`),
    )).should.throw(MatchError, 'JSON');
    (() => match(cons) (
      pattern `Cons(='a', b)` ((obj) => `${obj[1]}, ${obj[2]}`),
    )).should.throw(MatchError, 'JSON');
  });

  it('should throw a MatchError if there are extra commas', function() {
    const cons = new Cons(1, 2);
    (() => match(cons) (
      pattern `Cons(1, , 2)` ((obj) => `${obj[1]}, ${obj[2]}`),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons(a,,b)` (({ b }) => b),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons(,a,b)` (({ b }) => b),
    )).should.throw(MatchError, 'invalid');
  });

  it('should not throw a MatchError for trailing commas', function() {
    const cons = new Cons(1, 2);
    match(cons) (
      pattern `Cons(a,b,)` (({ b }) => b),
    ).should.equal(2);
    match(cons) (
      pattern `Cons(a,b,,)` (({ b }) => b),
    ).should.equal(2);
    match(cons) (
      pattern `Cons(a,b,,,,,,,,,)` (({ b }) => b),
    ).should.equal(2);
  });

  it('should throw a MatchError if the parentheses do not match in any pattern', function() {
    const cons = new Cons('first', 'second');
    (() => match(cons) (
      pattern `Cons(first, second)` (() => 'fail'),
      pattern `Cons(first, Cons second, third)))` (() => 'fail'),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons(first, second)` (() => 'fail'),
      pattern `Cons(first, Cons(second, third)` (() => 'fail'),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons(first, second` (() => 'fail'),
      pattern `Cons(first, Cons(second, third))` (() => 'fail'),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons first, second)` (() => 'fail'),
      pattern `Cons(first, Cons(second, third))` (() => 'fail'),
    )).should.throw(MatchError, 'invalid');
    (() => match(cons) (
      pattern `Cons(first)(second)` (() => 'fail'),
      pattern `Cons(first, Cons(second, third))` (() => 'fail'),
    )).should.throw(MatchError, 'invalid');
  });

  it('should throw a match error if the wrong number of elements is being extracted', function() {
    const cons = new Cons('first', 'second');
    (() => match(cons) (
      pattern `Cons(a)` (() => 'fail'),
    )).should.throw(MatchError, 'parameters');
    (() => match(cons) (
      pattern `Cons(a, b, c)` (() => 'fail'),
    )).should.throw(MatchError, 'parameters');
  });

  it('should re-throw the error that is thrown by the callback', function() {
    const cons = new Cons(1, 2);
    (() => match(cons) (
      pattern `Cons(a, b)` (() => { throw new Error('TheError'); })
    )).should.throw(Error, 'TheError');
  });

  // TODO: this will be much harder
  it.skip('should support arbitrary pattern shapes', function() {
    @data('$1 :: $2') class Cons2 { constructor(first, rest) {} }
    const list = new Cons2('first', new Cons2('second', Empty));
    match(list) (
      pattern `Cons2(first, rest)` (() => 'fail'),
      pattern `first :: second :: Empty` (({ first, second }) => `${first} ${second}`),
      pattern `first :: rest` (() => 'fail'),
    ).should.equal('first second');
  });

  // TODO: if the arbitrary pattern shapes are not implemented
  it.skip('should throw a PatternError if a pattern does not contain exactly one set of matching parentheses', function() {
    (() => { @data('A($1, $2') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A $1, $2)') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A($1, ($2))') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A($1, ($2)') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A($1), $2)') class T {} }).should.throw(PatternError, 'invalid');
  });
  it.skip('should throw a PatternError if a pattern has extra commas', function() {
    (() => { @data('A($1,,$2)') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A(,$1,$2)') class T {} }).should.throw(PatternError, 'invalid');
    (() => { @data('A($1, , $2)') class T {} }).should.throw(PatternError, 'invalid');
  });
  it.skip('should not throw a PatternError for trailing commas', function() {
    (() => { @data('A($1,$2,)') class T {} }).should.not.throw(PatternError);
    (() => { @data('A($1, $2,,)') class T {} }).should.not.throw(PatternError);
    (() => { @data('A($1, $2,,,,,,,,)') class T {} }).should.not.throw(PatternError);
  });
});
