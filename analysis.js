/**
 * Hositing Nested Functions
 * @description An analysis using Jalangi2 to find the nested functions in Javascript which can be hoisted to the suitable scope
 * @author Anam Dodhy and Chaitra Hegde
 * Please uncomment the commented console.logs to see the flow of our approach
 */

(function (sandbox) {

    function MyAnalysis() {

        var roots = [];
        var currentNode = null;
        var indirectEval = false;
        var indirectEvalFuncNames = [];
        var iidToLocation = sandbox.iidToLocation;

        /**
         * A Tree structure to store the hierarchy of nested functions
         * @param data function details to add to the tree node
         * @param parent parent of the node
         */
        function TreeNode(data, parent, funcIid) {
            this.parent = parent;
            this.children = [];
            this.variables = [];
            this.funcBody = null;
            this.name = null;
            this.isHoistableWithParent = false;
            this.nonHoistableParents = [];
            if (data.name) {
                this.name = data.name;
            } else {
                // assign "anonymous" string to the function name for anonymous functions
                this.name = "anonymous";
            }
            this.iid = funcIid;
        }

        /**
         * checking the first condition for hoisting nested functions
         * function checks whether the child function node is dependent on any of the parent function node variables
         * these variables can be either local variable or parameters of parent node
         */
        TreeNode.prototype.compareHoistabilityWithParent = function() {
            var isHoistable = true;
            if(this.parent) {
                var childVars = getVariableNames(this.variables, true);
                var parentVars = getVariableNames(this.parent.variables, false);

                console.log("Self Variables: "+childVars+" Parent Variables: "+parentVars)
                if(childVars.length > 0){
                    childVars.forEach(function(childVar){
                        if(parentVars.indexOf(childVar)>-1) isHoistable = false;
                    })
                }
            } else {
                console.log("Node has no parents");
            }
            return isHoistable;
        }

        /**
         * Adding a child to the current node
         * @param child newly created node or the new function entered
         */
        TreeNode.prototype.addChild = function (child) {
            // check if 'this' and child are same. If yes, then it is a recursive call. Do not add child
            if(this.funcBody === child.funcBody && this.name.localeCompare(child.name) == 0
                // if the function name is anonymous then it is part of un-named function expression
                // we need to add that to our stack
                && this.name != "anonymous" && child.name != "anonymous"){

                //console.log(child.name + " is a recursive function")
            } else {
                child.parent = this;
                this.children.push(child);
            }
        };

        /**
         * function gets the list of variable names from an array of variables
         * @param variableObjects array of variables
         * @param isChild
         */
        function getVariableNames(variableObjects, isChild) {
            var variableNames = [];

            if(variableObjects.length > 0){
                variableObjects.forEach(function(variable) {
                    if (isChild && (variable.jalangiApi == "declare" || variable.jalangiApi == "write")){
                    // ignore child declared variables
                    }
                    else{
                        variableNames.push(variable.name)
                    }
                });
            }
            return variableNames;
        }

        /**
         * function returns the line number for a given function in a node
         * @param node
         */
        function getLocation(node){
            return J$.iidToLocation(J$.sid, node.iid).split(":")[2];;
        }

        /**
         * function checks the hoistability flags of a given node and logs a string with the result
         * @param node
         */
        function printNodeResult(node){
            result = "";

            if (node.isHoistableWithParent === true){
                result = "\n"+node.name +" at line "+getLocation(node)+" under "+ node.parent.name +" at line "+getLocation(node.parent)+ " is hoistable GREAT!! ";
                if (node.nonHoistableParents.length > 0){
                    result = result + "But NOT hoistable under ";
                    node.nonHoistableParents.forEach(function (nonHoistableParent){
                    result = result + nonHoistableParent +", ";
                });
                }
            } else {
                result = "\n"+node.name +" at line "+getLocation(node)+ " under "+  node.parent.name +" at line "+getLocation(node.parent)+ " is NOT hoistable.";
            }
            console.log(result)
        }

        /**
         * function loops through the whole tree and checks the hoistability of each node
         * with nodes at the parent level and above
         * @param node it is the root node
         */
        function checkHoistabilityWithParentSiblings(node){
            if(node.children && node.children.length > 0) {
                node.children.forEach(function(child) {
                    if (child.parent.parent && child.isHoistableWithParent == true){
                      checkHoistabilityOfNode(child, child.parent.parent)
                    }
                    printNodeResult(child)
                    checkHoistabilityWithParentSiblings(child)
                });
            } else {
              return;
            }
          }

        /**
         * function checks if there is any function with the same name
         * defined or any variable with the same name as the function to be hoisted
         * exist in the hierarchy above the given function node level
         * @param nodeToCheck
         * @param grandparentNode grandparent or parent's parent node of the nodeToCheck
         */
        function checkHoistabilityOfNode(nodeToCheck, grandparentNode){
            if (grandparentNode && grandparentNode.children.length > 0 && grandparentNode.variables.length > 0){
                grandparentNode.children.forEach(function (child){
                    if (nodeToCheck.name === child.name){
                        nodeToCheck.nonHoistableParents.push(grandparentNode.name)
                        return
                    } else {
                        grandparentNode.variables.forEach(function(variable){
                            if(nodeToCheck.name === variable.name){
                                nodeToCheck.nonHoistableParents.push(grandparentNode.name);
                                return;
                            }
                        })
                    }
                });
            }
        }

        /**
         * add function variables to a node which is representing a single function
         * @param _name name of the variable
         * @param _isArgument
         */
        TreeNode.prototype.addVariable = function (_name, _isArgument, _jalangiApi, _type ) {
           if(_type != 'undefined' && _type != 'function'){
                var newVariable = {
                    name: _name,
                    isArgument: _isArgument,
                    jalangiApi: _jalangiApi,
                    type: _type
                }
                var variableAlreadyExists = false;

                if(this.variables.length > 0){
                    this.variables.forEach(function(variable) {
                        if ( (variable.jalangiApi === variable.jalangiApi)
                                && newVariable.name === variable.name){
                            variableAlreadyExists = true;
                        }
                    });
                }
                if (!variableAlreadyExists){
                  this.variables.push(newVariable);
                  //console.log("Added variable " +newVariable.name+" of type "+ newVariable.type+" to "+ this.name+" using JalangiApi "+newVariable.jalangiApi);
                }
           }
        };

        /**
         * function checks the vailidty of a given variable by making sure that it is not a function
         * @param _name name of the variable
         * @param _val
         */
        function checkValidityOfVariable(_name, _val){
          try{
            if (_val != undefined){
                // if the function is being declared then we need to ignore it
                if(_val.toString().indexOf("function") > -1 || _name.toString().indexOf("arguments") > -1 ){
                    return true;
                } else {
                    return false;
                }
            }
          }
          catch(err){
              console.log("Error while validating the variable: "+err);
          }
        }

         /**
         * function checks whether a node is dependent on it's parent by using any of the parent variables
         * @param node
         */

        function checkHoistabilityWithParent(node){
            node.isHoistableWithParent = false;
            node.isHoistableWithParent = node.compareHoistabilityWithParent();
            console.log(node.name +  " isHoistableWithParent? ",node.isHoistableWithParent);
        }

        /**
         * this analysis uses Jalangi2 literal callback to get the name of function in indirect eval
         * @param val initial value of the variable that is declared
         */
        this.literal = function(iid, val, hasGetterSetter){
            if(val != null){
                var literalName = val.name;
                if(indirectEval === true && literalName != undefined){
                    indirectEvalFuncNames.push(literalName);
                    indirectEval = false;
                }
            }
        }

        /**
         * this analysis uses Jalangi2 instrumentCodePre callback to know if the eval is direct or indirect
         * @param isDirect static unique instruction identifier of this callback
         */
        this.instrumentCodePre= function(iid, code, isDirect){
            if(isDirect === false){
                indirectEval = true;
            }
        }

        /**
         * this analysis uses Jalangi2 declare callback for validating and adding the variable to the node
         * @param name name of the variable that is declared
         * @param val initial value of the variable that is declared
         * @param isArgument true if the variable is arguments or a formal parameter
         */
        this.declare = function (iid, name, val, isArgument, argumentIndex, isCatchParam) {
            var variableType = typeof val;
            if(!checkValidityOfVariable(name, val) && (currentNode)){
                currentNode.addVariable(name, isArgument, "declare", variableType);
            }
            return {result: val};
        };

       /**
         * this analysis uses Jalangi2 read callback for validating and adding the variable to the node
         * @param name name of the variable that is declared
         * @param val initial value of the variable that is declared
         */
        this.read = function (iid, name, val, isGlobal, isScriptLocal) {
            var variableType = typeof val;
            if(!checkValidityOfVariable(name, val) && (currentNode)){
                currentNode.addVariable(name, false, "read", variableType);
            }
            return {result: val};
        };

        /**
         * this analysis uses Jalangi2 write callback for validating and adding the variable to the node
         * ignore the variable(called indirect eval) which is a reference to an eval
         * @param name name of the variable that is declared
         * @param val initial value of the variable that is declared
         */
        this.write = function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            var variableType = typeof val;
            if(val != eval) {
                if(!checkValidityOfVariable(name, val) && (currentNode)){
                    currentNode.addVariable(name, false, "write",variableType);
                }
            }
            return {result: val};
        };

        /**
         * this analysis uses Jalangi2 functionEnter callback for creating a new tree node for every function definition
         * @param iid static unique instruction identifier of this callback
         * @param f the function object whose body is about to get executed
         */
        this.functionEnter = function (iid, f, dis, args) {
            console.log("\n----functionEnter---")
            var curName = "NOPARENT";
            if(currentNode) curName = currentNode.name;
            var newNode = null;
            newNode = new TreeNode(f, currentNode, iid);
            console.log("This function is called for " + newNode.name + " and the currentNode is " + curName)

            // add root node
            if (currentNode === null) {
                currentNode = newNode;
                roots.push(newNode);
                console.log(currentNode.name+" is not nested");
            } else {
                if(indirectEvalFuncNames.length > 0){
                    indirectEvalFuncNames.forEach(function(funcName) {
                        if (funcName != newNode.name){
                            currentNode.addChild(newNode);
                            console.log("Switching currentNode from " + currentNode.name + " to " + newNode.name)
                            currentNode = newNode;
                        }
                    });
                } else {
                    currentNode.addChild(newNode);
                    console.log("Switching currentNode from " + currentNode.name + " to " + newNode.name)
                    currentNode = newNode;
                }
            }
        };

        /**
         * this analysis uses Jalangi2 functionExit callback for checking the hoistability of a function
         * @param iid static unique instruction identifier of this callback
         */
        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            console.log("\n----------on function exit-------------");
            console.log("Current node is "+currentNode.name+" at line "+getLocation(currentNode));

            checkHoistabilityWithParent(currentNode);

            if (currentNode != null && currentNode.parent != null) {
                currentNode = currentNode.parent;
                console.log("Current node on exit is "+currentNode.name+" at line "+getLocation(currentNode))
            }else if (currentNode.parent == null){
              console.log("\n");
              console.log("+++++RESULT+++++");
              console.log(currentNode.name+" is the root node and hoisting is not required");
              checkHoistabilityWithParentSiblings(currentNode);
              if(indirectEvalFuncNames.length > 0){
                indirectEvalFuncNames.forEach(function(funcName) {
                    console.log(funcName+" is a function invoked by an Indirect Eval. So hoisting is not required.");
                });
            }
            }
        };
    }
    sandbox.analysis = new MyAnalysis();
}(J$));