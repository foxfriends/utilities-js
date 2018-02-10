/**
 * Function composition
 */
module.exports = (f, g) => x => f(g(x))
