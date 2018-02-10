/**
 * Option type for JS.
 */
'use strict';

import Monad from '../monad';
import { data } from '../match';
import compose from '../compose';

export class Option extends Monad {
  static return(x) { return new Some(x); }
  static fail() { return new None; }
  bind(f) { return this.flatMap(f) }

  static from(it) {
    if(it === null || it === undefined) {
      return new None
    } else {
      return new Some(it)
    }
  }
}

@data()
export class None extends Option {
  static new () { return new None }

  get isNone() { return true; }
  get isSome() { return false; }
  flatMap() { return this; }
  map() { return this; }
  unwrap() { throw new TypeError('Cannot unwrap an Optional which holds no value'); }
  unwrapOr(x) { return x; }
}
@data()
export class Some extends Option {
  static new(it) { return new Some(it) }
  constructor(it) {
    super()
    this.value = it;
  }
  get isNone() { return false; }
  get isSome() { return true; }

  flatMap(f) {
    const result = f(this.value);
    if(result instanceof Option) {
      return result;
    } else {
      throw new TypeError(`Expected type Option returned from the transformer passed to flatMap, found ${result}`);
    }
  }
  map(f) { return this.flatMap(compose(Some.new, f)) }

  unwrap() { return this.value; }
  unwrapOr() { return this.value; }
}
