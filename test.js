'use strict';
const mocha = new (require('mocha'));
require('./get-directories')('./')
  .filter((f) => f !== 'node_modules' && f !== 'test-resources' && f !== '.git')
  .map((dir) => `./${dir}/index.test.js`)
  .forEach(mocha.addFile.bind(mocha));
mocha.run();
