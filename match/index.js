/**
 * Pattern matching-like abilities for JS.
 */
'use strict';

export const Extractor = Symbol('Extractor');
const Arguments = Symbol('Arguments');
const Pattern = Symbol('Pattern');

const constructors = new Map();

export class MatchError extends Error {}
export class PatternError extends Error {}
class InternalMatchError extends Error {}

/**
 * Decorator, registering a class as matchable, and setting up a default
 * extractor.
 * @param {string} pattern the pattern that this class is represented by.
 *        Must include a name, optionally followed by 1-indexed
 *        numbered arguments in parentheses (eg. @data('Cons($1, $2)')),
 *        where the numbered arguments correspond to the arguments given to the
 *        constructor.
 * A class decorated with @data can may override the static [Extractor] method to
 * provide custom extraction behaviour, instead of using the constructor's
 * arguments.
 *
 * @function [Extractor] extracts values from the instance being matched against
 * @param {object} inst the instance to extract values from
 * @returns {Array[any]} the values, in order, that correspond to the pattern's
 *                       $1, $2, .. $n. Must have exactly n elements.
 */
export function data(pattern) {
  return function(target, key, descriptor) {
    if(!pattern) {
      let args = [];
      for(let i = 0; i < target.length; ++i) { args.push(`$${i + 1}`); }
      pattern = `${target.name}(${args.join(',')})`;
    }
    const [name, ...args] = pattern.split(/[(,)]/g);
    // TODO: pattern validation
    const indices = args.map(_ => +_.trim().slice(1)).filter(_ => _ > 0).map(i => i - 1);
    // NOTE: the Extractor must be side-effect free, or there will be strange behaviour
    target[Extractor] = target[Extractor] || (inst => indices.map(i => inst[Arguments][i]));
    const ctor = class extends target {
      constructor(...args) {
        super(...args);
        this[Arguments] = args;
      }
    }
    constructors.set(ctor, name);
    return ctor;
  }
}

/**
 * The pattern matching block. Called once with the object, then again with the
 * patterns.
 * @returns {any} the return value of the matching pattern
 */
export function match(obj) {
  return (...cases) => {
    for(const c of cases) {
      if(c[Pattern].name === constructors.get(obj.constructor)) {
        try {
          return c(obj);
        } catch(error) {
          if(error instanceof InternalMatchError) {
            continue;
          }
          throw error;
        }
      }
    }
    throw new MatchError('Match was not exhaustive');
  }
}

/**
 * Uses the class's extractor to build the result object
 * @param {Array[string|object]} extractors the names/objects to bind the extracted values to
 * @param {object} inst the instance to match against
 * @returns {object} an object with the names from the pattern
 */
function extractor(extractors, inst) {
  if(extractors.name !== constructors.get(inst.constructor)) {
    throw new InternalMatchError(`Match class mismatch ${extractors.name} with ${constructors.get(inst.constructor)}`);
  }
  const extracted = inst.constructor[Extractor](inst);
  if(extracted.length !== extractors.args.length) { throw new MatchError(`Expected ${extracted.length} parameters, but found ${extractors.args.length}`); }
  return extractors.args.reduce((obj, ext, i) => {
    switch(typeof ext) {
      case 'string':
        if(ext[0] === '=') {
          let val;
          try {
            val = JSON.parse(ext.slice(1));
          } catch(error) {
            throw new MatchError(`Invalid JSON in pattern ${ext}`);
          }
          if(deepEqual(val, extracted[i])) {
            return obj;
          } else {
            throw new InternalMatchError('Literal value mismatch');
          }
        } else {
          return ext === '*' ? obj : { ...obj, [ext]: extracted[i] };
        }
      case 'object':
        return { ...obj, ...extractor(ext, extracted[i]) }
    }
  }, {});
}

/**
 * Parses a pattern into extractors
 * @param {string} pat the pattern to parse
 * @returns {object} the extractors
 */
function parse(pat) {
  pat = pat.trim();
  const [name] = pat.split('(', 1);
  if(name.indexOf(')') !== -1) { fail(); }
  if(pat.indexOf('(') !== -1 && pat[pat.length - 1] !== ')') { fail(); }
  let body = pat.slice(name.length + 1, -1);
  while(body[body.length - 1] === ',') { body = body.slice(0, -1); }
  const tokens = [];
  while(body) {
    let token = getToken(body);
    body = body.slice(token.length + 1);
    token = token.trim();
    if(!token) { fail(); }
    tokens.push(token);
  }
  return {
    name,
    args: tokens.map(token => {
      if(token.indexOf('(') === -1) {
        if([...constructors.values()].includes(token)) {
          return { name: token, args: [] };
        }
        return token;
      } else {
        try {
          return parse(token);
        } catch(_) { fail(); }
      }
    })
  };

  function getToken(text) {
    let depth = 0, i = 0;
    while((depth !== 0 || text[i] !== ',') && text[i]) {
      if(text[i] === '(')       { ++depth; }
      else if(text[i] === ')')  { --depth; }
      ++i;
      if(depth < 0) { fail(); }
    }
    if(depth !== 0) { fail(); }
    return text.slice(0, i);
  }

  function fail() {
    throw new MatchError(`Provided pattern ${pat} is invalid`);
  }
}

/**
 * Template tag for a pattern
 * @returns {Function} a function that takes a callback to pass in the bound names
 */
export function pattern(strings, ...values) {
  const pattern = values.reduce((acc, _, i) => acc + JSON.stringify(_) + strings[i + 1], strings[0]);
  const extractors = parse(pattern);
  return cb => {
    const c = inst => cb(extractor(extractors, inst));
    c[Pattern] = extractors;
    return c;
  }
}

/**
 * Compares two values for structural equivalence.
 * @param {any} a the first value to compare
 * @param {any} b the second value to compare
 * @returns {boolean} whether the two values are equal or not
 */
function deepEqual(a, b) {
  if(a === b) { return true; }
  if(typeof a !== typeof b) { return false; }
  if(typeof a === 'function') { return false; }
  if(typeof a === 'object') {
    if(a instanceof Array && b instanceof Array && a.length === b.length) {
      return a.map((v, i) => [v, b[i]]).every(pair => deepEqual(...pair));
    } else if(a instanceof Object && b instanceof Object) {
      const ka = Object.keys(a).sort();
      const kb = Object.keys(b).sort();
      if(!deepEqual(ka, kb)) { return false; }
      return ka.map(key => [a[key], b[key]]).every(pair => deepEqual(...pair));
    }
  }
}
