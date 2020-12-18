import makeOneClass from './test_revealing_pattern.js';
// const oneClass = require('./test_revealing_pattern');

const instanceOfOneClass = makeOneClass();
console.log(`Only member exported => oneClass.getToto() => ${instanceOfOneClass.getToto()}`);
console.log(`So hidden prop toto undefined => oneClass.toto => ${instanceOfOneClass.toto}`);
