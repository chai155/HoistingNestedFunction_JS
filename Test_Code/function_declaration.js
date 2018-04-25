function functionParent(a) { 
  var b = 1;
  function functionChild1() {
    var b = a + "Child1";

    function functionChild2() { 
      var b =  "CHild2";
    }
    functionChild2();
  }
  function functionChild2(){ 
    var z = 9;
  }
  functionChild2();
  return functionChild1();
}

module.exports = {
    functionParent: functionParent
}
