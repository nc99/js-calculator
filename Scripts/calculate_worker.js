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
		stored_arguments.push({
			"type": "text",
			"value": input.substring(input.indexOf(escape_char) + 1, input.indexOf(escape_char) + 2)
		});
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
		var output = {
			"type": "text",
			"value": getArguments(argument)
		};
	}

	stored_arguments.push(output);
	return start_marker + (stored_arguments.length - 1) + end_marker;
}

function evaluateNestedFunctions(input) {
	if (input[input.length - 1] !== ')') {
		input = input + ')';
	}
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
		if ((functionName == "") || (functionName == " ")) {
			return args;
		} else if (functionName == "factorial") {
			return functions.factorial(args);
		} else if (functionName == "draw_pixels") {
			return functions.draw_pixels(args);
		} else if (functionName == "mandelbrot") {
			return functions.mandelbrot(args);
		} else if (functionName == "canvas") {
			return functions.canvas(args);
		} else if (functionName == "sum" || functionName == "+") {
			return functions.sum(args);
		} else if (functionName == "multiply" || functionName == "*") {
			return functions.multiply(args);
		} else if (functionName == "store") {
			return functions.store(args);
		} else if (functionName == "read") {
			return functions.read(args);
		} else if (functionName == "list_cookies") {
			return functions.list_cookies(args);
		} else if (functionName == "raw_json") {
			return functions.raw_json(args);
		} else if (functionName == "finals_grade") {
			return functions.finals_grade(args);
		} else if (functionName == "get_bookmarklet") {
			return functions.get_bookmarklet(args);
		} else if (functionName == "get_link") {
			return functions.get_link(args);
		} else if (functionName == "text") {
			return functions.text(args);
		} else if (functionName == "factor") {
			return functions.factor(args);
		} else if (functionName == "executable") {
			return functions.executable(args);
		} else if (functionName == "execute") {
			return functions.execute(args);
		} else if (functionName == "equals") {
			return functions.equals(args);
		} else if (functionName == "if") {
			return functions.if(args);
		} else if (functionName == "select") {
			return functions.select(args);
		} else if (functionName == "array") {
			return functions.array(args);
		} else if (functionName == "data") {
			return functions.data(args);
		} else if (functionName == "labeled_array") {
			return functions.labeled_array(args);
		} else if (functionName == "true") {
			return functions.boolean_true(args);
		} else if (functionName == "false") {
			return functions.boolean_false(args);
		} else if (functionName == "meta") {
			return functions.meta(args);
		} else if (functionName == "plain_text") {
			return functions.plain_text(args);
		} else if (functionName == "window") {
			return functions.window(args);
		} else if (functionName == "property") {
			return functions.property(args);
		} else if (functionName == "properties") {
			return functions.properties(args);
		} else if (functionName == "children") {
			return functions.children(args);
		} else if (functionName == "executable_constructor") {
			return functions.executable_constructor(args);
		} else if (functionName == "inject") {
			return functions.inject(args);
		} else if (functionName == "set_placeholder") {
			return functions.set_placeholder(args);
		} else if (functionName == "get_placeholder") {
			return functions.get_placeholder(args);
		} else if (functionName == "placeholders") {
			return functions.placeholders(args);
		} else if (functionName == "executable_part") {
			return functions.executable_part(args);
		} else if (functionName == "remainder" || functionName == "%") {
			return functions.remainder(args);
		} else if (functionName == "greater_than" || functionName == "gt") {
			return functions.greater_than(args);
		} else if (functionName == "less_than" || functionName == "lt") {
			return functions.less_than(args);
		} else if (functionName == "greater_than_or_equal" || functionName == "ge") {
			return functions.greater_than_or_equal(args);
		} else if (functionName == "less_than_or_equal" || functionName == "le") {
			return functions.less_than_or_equal(args);
		} else if (functionName == "dev_mode") {
			return functions.dev_mode(args);
		} else if (functionName == "echo") {
			return functions.echo(args);
		} else if (functionName == "help") {
			return functions.help(args);
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

	var pieces = input.substring(input.indexOf('(') + 1).split(start_marker);

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