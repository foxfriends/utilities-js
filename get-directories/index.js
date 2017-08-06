/* (string) => string[]

  Returns an array of all directories in a directory
*/
'use strict';
const fs = require('fs');
const path = require('path');
module.exports = (dir) => fs.readdirSync(dir).filter((file) => fs.statSync(path.join(dir, file)).isDirectory());
