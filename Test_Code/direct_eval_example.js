x = 3;
y = 5;
function parent() {
  var x = 2, y = 4;
  // Direct call, uses local scope, result is 6
  eval('function directEval() {console.log("In function directEval: ",x); return x + y; }');
  directEval();
}

module.exports = {
  parent: parent
}