var functionOne = function functionOne(a) {
    var b = 1;
    var functionThree = 3;

    var two = function functionTwo(){ 
      var f = 3 ;
      var three = function functionThree(){ 
          var f = 1
      }
      return three()
    }
    return two();
}

module.exports = {
    functionOne: functionOne
}
