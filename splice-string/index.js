/* (string, number, [number, [...any]]) => string;

  Works like [].splice but on a string. Returns the new string, not the removed
  pieces.
*/
module.exports = (str, start, deleteCount, ...inserts) => {
  if(start < 0) start = str.length + start;
  if(deleteCount === undefined) deleteCount = str.length - start;
  return str.slice(0, start) + (inserts.join('')) + str.slice(start + deleteCount);
}
