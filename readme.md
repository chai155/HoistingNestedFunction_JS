## Finding Hoist-able Nested Functions in Javascript using Jalangi

This repository contains an analysis(analysis.js) written using Jalangi2 dynamic analysis framework to detect hoistable functions in a given Javascript code. 

There are sample examples for each corner case present at the following locations:
- Function declaration:
  - Test_Code/function_declaration.js
- Anonymous Function Expression:
  - Test_Code/function_expression_anonymous.js
- Function Expression:
  - Test_Code/function_expression.js
- Direct Eval:
  - Test_Code/direct_eval_example.js
- InDirect Eval:
  - Test_Code/indirect_eval_example.js
- Recursive Functions:
  - Test_Code/recursion_example.js

Each of the examples above are refered in the [mainExample](Test_Code/mainExample.js) file. Following are the steps that need to be performed.
1. Clone or download Jalangi2 from https://github.com/Samsung/jalangi2
2. Create a new folder with the name of your choise.
3. Place this repository inside the newly created folder
4. Open command prompt and go to the directory where analysis.js is located
5. Then open [mainExample](Test_Code/mainExample.js) file and uncomment the example file you want to execute.
6. Now execute the following command:
   - node ../src/js/commands/jalangi.js --inlineIID --inlineSource --analysis analysis.js mainExample.js
   This command will run our analysis on the example given and output the result with functions marked as hoistable and not hoistable.

More about Jalangi2 can be found in https://github.com/Samsung/jalangi2