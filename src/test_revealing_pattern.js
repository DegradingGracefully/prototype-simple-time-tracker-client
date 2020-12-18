// export default (function oneClass() {
function makeOneClass() {
  const toto = 'tata';

  function getToto() { return toto; }

  return {
    getToto
  };
}

const instanceOfOneClass = makeOneClass();
console.log(`Only member exported => oneClass.getToto() => ${instanceOfOneClass.getToto()}`);
console.log(`So hidden prop toto undefined => oneClass.toto => ${instanceOfOneClass.toto}`);

export default makeOneClass;
/* module.exports = {
  oneClass
}; */
