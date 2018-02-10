/**
 * Generic monad interface, to be implemented by actual monad instances
 */

module.exports = class Monad {
  static fail(error) { throw error; }

  static return(f) { throw new Error('Unimplemented'); }
  bind(f) { throw new Error('Unimplemented'); }
}
