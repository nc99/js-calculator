importScripts("jsbn/jsbn.js");
importScripts("jsbn/jsbn2.js");
importScripts("functions.js");

addEventListener('message', function(e) {
    processMessage(e);
}, false);

function processMessage(e) {
    var input = e.data.input;
    var id = e.data.id;
    var output = evaluateNestedFunctions(preprocess(input));

    postMessage({
        "id": id,
        "output": output
    });
    close();
}

// Evaluate functions
var stored_arguments = [];
var start_marker = "<";
var end_marker = ">";
var escape_char = "\\";

function preprocess(input) {
    var pieces = input.split(escape_char);
    
    while (input.split(escape_char).length > 1) {
        stored_arguments.push({"type":"text", "value":input.substring(input.indexOf(escape_char) + 1, input.indexOf(escape_char) + 2)});
        input = input.substring(0, input.indexOf(escape_char)) + start_marker + (stored_arguments.length - 1) + end_marker + input.substring(input.indexOf(escape_char) + 2);
    }
    
    return input;
}

function processArgument(argument) {
    if (argument.split(",").length > 1) {
        // It is an array
        var arguments = argument.split(",");
        var output = {
            "type": "array",
            "objects": []
        };
        for (var i = 0; i < arguments.length; i++) {
            if ((arguments[i].split(start_marker).length > 1) && (arguments[i].split(end_marker).length > 1)) {
                output.objects.push(getArguments(arguments[i]));
            } else {
                output.objects.push({
                    "type": "text",
                    "value": arguments[i]
                });
            }
        }
    } else {
        // Not an array
        if ((argument.split(start_marker).length > 1) && (argument.split(end_marker).length > 1)) {
            console.log(argument);
            var output = {
                "type": "text",
                "value": getArguments(argument)
            };
        } else {
            var output = {
                "type": "text",
                "value": argument
            };
        }
    }

    stored_arguments.push(output);
    return start_marker + (stored_arguments.length - 1) + end_marker;
}

function evaluateNestedFunctions(input) {
    var nestedFunction = input.substring(0, input.indexOf(")"));

    // This section gets the nested function to evaluate

    // Split at first comma going back from ( of the function if there is one or
    // Split at first ( going back from ( of the function

    // testing(1,testing(testing(2,3)
    var beforeArguments = nestedFunction.substring(0, nestedFunction.lastIndexOf("(") - 1);
    // testing(1,testing(testing

    if (beforeArguments.lastIndexOf(",") > beforeArguments.lastIndexOf("(")) {
        // There is a comma before the function name
        nestedFunction = nestedFunction.substring(nestedFunction.lastIndexOf(",", nestedFunction.lastIndexOf("(") - 1) + 1);
    } else {
        // There is a ( before the function name
        nestedFunction = nestedFunction.substring(nestedFunction.lastIndexOf("(", nestedFunction.lastIndexOf("(") - 1) + 1);
    }

    nestedFunctionBegin = input.indexOf(nestedFunction);
    nestedFunctionEnd = input.indexOf(")");

    // This section evaluates the nested function if the original input has a nested function.
    // If the original input does not have a nested function, it returns the evaluation of the original.

    if (input.split("(").length > 2) {
        // Original input has a nested function
        // Evaluate the nested function and replace it with its value, then evaluateNestedFunctions on that
        var firstPart = input.substring(0, nestedFunctionBegin);
        var secondPart = input.substring(nestedFunctionEnd + 1);

        stored_arguments.push(evaluateNestedFunctions(nestedFunction));
        var marker_index = stored_arguments.length - 1;

        return evaluateNestedFunctions(firstPart + start_marker + marker_index + end_marker + secondPart);
    } else {
        // Original input does not have a nested function, so return the original input evaluated.
        if (input.split(",").length === 1) {
            // Function has only one argument
            return evaluateFunction(nestedFunction);
        } else {
            // Function is not in one argument form
            var argument = input.substring(input.substring(0, input.indexOf(")")).lastIndexOf("(") + 1, input.indexOf(")"));

            var firstPartOfArgument = input.substring(0, input.substring(0, input.indexOf(")")).lastIndexOf("(") + 1);
            var secondPartOfArgument = input.substring(input.lastIndexOf(")"));

            return evaluateNestedFunctions(firstPartOfArgument + processArgument(argument) + secondPartOfArgument);
        }
    }
}


function evaluateFunction(input) {
    var functionName = getFunctionName(input);
    var args = getArguments(input);

    if (true) {
        if (functionName == "") {
            return args;
        } else if (functionName == "factorial") {
            return factorial(args);
        } else if (functionName == "drawPixels") {
            return drawPixels(args);
        } else if (functionName == "mandelbrot") {
            return mandelbrot(args);
        } else if (functionName == "canvas") {
            return canvas(args);
        } else if (functionName == "png") {
            return png(args);
        } else if (functionName == "sum") {
            return sum(args);
        } else if (functionName == "multiply") {
            return multiply(args);
        } else if (functionName == "store") {
            return store(args);
        } else if (functionName == "read") {
            return read(args);
        } else if (functionName == "list_cookies") {
            return list_cookies(args);
        } else if (functionName == "object_to_text") {
            return object_to_text(args);
        } else if (functionName == "finals_grade") {
            return finals_grade(args);
        } else if (functionName == "get_bookmarklet") {
            return get_bookmarklet(args);
        } else if (functionName == "text") {
            return text(args);
        } else if (functionName == "factor") {
            return factor(args);
        } else if (functionName == "testing") {
            return testing(args);
        } else if (functionName == "help") {
            return help(args);
        } else if (functionName == "clear") {
            return "";
        } else {
            return {
                "type": "error",
                "message": "Unknown function",
                "from": "function evaluator"
            };
        }
    } else {
        return {
            "type": "error",
            "message": "Syntax Error",
            "from": "function evaluator"
        };
    }
    return {
        "type": "error",
        "message": "Unknown error",
        "from": "function evaluator"
    };
}

function getFunctionName(input) {
    return input.substring(0, input.indexOf("("));
}

function getArguments(arg) {
    var input = arg;
    var output = "";

    var pieces = input.split(start_marker);

    for (var i in pieces) {
        if (i > 0) {
            var index_number = parseInt(pieces[i].substring(0, input.indexOf(end_marker)));
            var referenced_object = stored_arguments[index_number];
            if (referenced_object.type === "text") {
                output += referenced_object.value + pieces[i].substring(pieces[i].indexOf(end_marker) + 1);
            } else {
                return stored_arguments[index_number];
            }
        } else {
            output += pieces[i];
        }
    }
    return {
        "type": "text",
        "value": output
    };
}