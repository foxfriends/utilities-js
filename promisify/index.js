/* ((...any, (Error, T) => _) => _) => Promise<T>
   reverse: ((...any, (T, Error) => _) => _) => Promise<T>

  Turns a callback function into a Promise function by filling the callback
  with the resolver. For non-standard functions with reversed callback
  parameters, the reverse method will resolve correctly.

  Similar to Bluebird.promisify, this was created to avoid including the entire
  massiveness of Bluebird.
*/
module.exports = (fn) => (...args) => new Promise((res, rej) => fn(...args, (err, val) => err ? rej(err) : res(val)));
module.exports.reverse = (fn) => (...args) => new Promise((res, rej) => fn(...args, (val, err) => err ? rej(err) : res(val)));
