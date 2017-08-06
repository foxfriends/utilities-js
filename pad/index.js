/* (string, string, number[, boolean]) => string

  Pads str with char until it has reached the required len. Optionally can start
  from the end by specifying end to be true.
*/
'use strict';
module.exports = (str, char, len, end = false) => {
  while(str.length < len) {
    if(end) {
      str += char[0];
    } else {
      str = char[0] + str;
    }
  }
  return str;
};
