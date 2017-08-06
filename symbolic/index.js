/* Iterable<Symbol>

  Indefinitely generates Symbols to make pseudo-private members easier to define
*/
module.exports = {
  *[Symbol.iterator]() { while(true) yield Symbol(); },
  next() { return { value: Symbol(), done: false}; }
};
