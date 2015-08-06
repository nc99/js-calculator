var functions = {
	dataTypeError: function(arg) {
		return {
			"type": "error",
			"message": "Incorrect data input type",
			"from": arg
		};
	},
	domainError: function(arg) {
		return {
			"type": "error",
			"message": "Out of domain",
			"from": arg
		};
	},
	dev_mode: function(arg) {
		return {
			"type": "dev_mode",
			"value": arg.value
		};
	},
	window: function(arg) {
		return {
			"type": "window",
			"properties": arg.objects[0].properties,
			"children": arg.objects[1].children
		};
	},
	property: function(arg) {
		return {
			"type": "property",
			"name": arg.objects[0].value,
			"value": arg.objects[1].value
		};
	},
	properties: function(arg) {
		var output = {
			"type": "properties",
			"properties": {}
		};
		if (arg.type === "array") {
			for (var i in arg.objects) {
				output.properties[arg.objects[i].name] = arg.objects[i].value;
			}
		} else {
			output.properties[arg.name] = arg.value;
		}
		return output;
	},
	children: function(arg) {
		var output = {
			"type": "children",
			"children": []
		};
		if (arg.type === "array") {
			for (var i in arg.objects) {
				output.children.push(arg.objects[i]);
			}
		} else {
			output.children.push(arg);
		}
		return output;
	},
	data: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("data");
		}
		var data_arrays = arg.objects;
		var dimensions = data_arrays[0].objects.length;
		for (var i in data_arrays) {
			if (data_arrays[i].type !== "array") {
				return this.dataTypeError("data");
			}
			if (data_arrays[i].objects.length !== dimensions) {
				return {
					"type": "error",
					"message": "Inconsistent data dimensions",
					"from": "data"
				};
			}
			for (var j in data_arrays[i].objects) {
				data_arrays[i].objects[j] = parseFloat(data_arrays[i].objects[j].value);
			}
		}
		return {
			"type": "data",
			"dimensions": dimensions,
			"data": data_arrays
		};
	},
	array: function(arg) {
		return {
			"type": "array",
			"objects": [arg]
		};
	},
	plain_text: function(arg) {
		if (arg.type !== "text") {
			return this.dataTypeError("plain_text");
		}
		return arg.value;
	},
	meta: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("meta");
		}
		var property = arg.objects[0];
		var value = arg.objects[1];
		var object = arg.objects[2];

		object[property] = value;

		return object;
	},
	boolean_true: function(arg) {
		return {
			"type": "boolean",
			"value": true
		};
	},
	boolean_false: function(arg) {
		return {
			"type": "boolean",
			"value": false
		};
	},
	labeled_array: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("labeled_array");
		}
		var array = arg.objects;
		var output = {
			"type": "labeled array",
			"object": {}
		};

		for (var i = 0; i < array.length - 1; i += 2) {
			output.object[array[i].value] = array[i + 1];
		}

		return output;
	},
	execute: function(arg) {
		if (arg.type !== "executable" && arg.type !== "array") {
			return this.dataTypeError("execute");
		}
		if (arg.type === "array") {
			var output = {
				"type": "array",
				"objects": []
			};
			for (var i in arg.objects) {
				output.objects.push(evaluateNestedFunctions(preprocess(arg.objects[i].command)));
			}
			return output;
		}
		return evaluateNestedFunctions(preprocess(arg.command));
	},
	executable: function(arg) {
		if (arg.type !== "text") {
			return this.dataTypeError("executable");
		}
		return {
			"type": "executable",
			"command": arg.value
		};
	},
	select: function(arg) {
		if (arg.objects[0].type !== "text") {
			return this.dataTypeError("select");
		}
		if (arg.objects[1].type === "array") {
			return arg.objects[1].objects[parseInt(arg.objects[0].value)];
		} else if (arg.objects[1].type === "labeled array") {
			return arg.objects[1].object[arg.objects[0].value];
		} else {
			return this.dataTypeError("select");
		}
	},
	if: function(arg) {
		if (arg.objects[0].type !== "boolean") {
			return this.dataTypeError("if");
		}

		if (arg.objects[0].value === true) {
			return arg.objects[1];
		} else {
			return arg.objects[2];
		}
	},
	equals: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("equals");
		}
		if (JSON.stringify(arg.objects[0]) === JSON.stringify(arg.objects[1])) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	text: function(arg) {
		if (JSON.stringify(arg.objects[0]) === JSON.stringify(arg.objects[1])) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	factor: function(arg) {
		var getPrimeFactor = function(input) {
			for (var i = 2; i <= Math.sqrt(input); i++) {
				if ((input % i) === 0) {
					return i;
				}
			}
			return input;
		};
		var isPrime = function(input) {
			if (getPrimeFactor(input) === input) {
				return true;
			} else {
				return false;
			}
		};

		var number = parseInt(arg.value);
		var factors = [];

		if (number < 0) {
			number = -1 * number;
		}

		while (!isPrime(number)) {
			var prime_factor = getPrimeFactor(number);
			factors.push({
				"type": "text",
				"value": prime_factor + ''
			});
			number = number / prime_factor;
		}
		factors.push({
			"type": "text",
			"value": number + ''
		});

		if (arg.value < 0) {
			factors[0].value = '-' + factors[0].value;
		}

		return {
			"type": "array",
			"objects": factors
		};
	},
	get_bookmarklet: function(arg) {
		return {
			"type": "link",
			"value": "Drag me to your bookmarks bar",
			"href": "javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://nicolaschan.com/js-calculator/Bookmarklet/bookmarklet.js';})();"
		};
	},
	get_link: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("get_link");
		}
		if (arg.objects.length !== 2) {
			return {
				"type": "error",
				"message": "Incorrect number of terms (expected 2)",
				"from": "get_link"
			};
		}
		var link = "https://nicolaschan.com/js-calculator/?input=";
		link = link + arg.objects[0].value;
		if (arg.objects[1].value === true) {
			link = link + '&evaluate=true';
		}
		return {
			"type": "link",
			"value": link,
			"href": link
		};
	},
	finals_grade: function(arg) {
		if (arg.type != "array") {
			return this.dataTypeError("finals_grade");
		}

		var finals_percent = parseFloat(arg.objects[0].value) / 100;
		var current_grade = parseFloat(arg.objects[1].value);
		var desired_grade = parseFloat(arg.objects[2].value);

		var required_finals_grade = (desired_grade - ((1 - finals_percent) * (current_grade))) / (finals_percent);
		return {
			"type": "text",
			"value": required_finals_grade
		};
	},
	list_cookies: function(arg) {
		if (arg.type != "text") {
			return this.dataTypeError("list_cookies");
		}
		return {
			"type": "list cookies"
		};
	},
	store: function(arg) {
		if (arg.type != "array") {
			return this.dataTypeError("store");
		}

		if (arg.objects[0].type != "text") {
			return this.dataTypeError("store");
		}

		if (arg.objects[2]) {
			return {
				"type": "set cookie",
				"name": arg.objects[0].value,
				"value": JSON.stringify(arg.objects[1]),
				"expires": parseInt(arg.objects[2].value)
			};
		} else {
			return {
				"type": "set cookie",
				"name": arg.objects[0].value,
				"value": JSON.stringify(arg.objects[1]),
				"expires": 1
			};
		}
	},
	read: function(arg) {
		if (arg.type != "text") {
			return this.dataTypeError("read");
		}

		return {
			"type": "read cookie",
			"name": arg.value
		};
	},
	raw_json: function(arg) {
		return {
			"type": "text",
			"value": JSON.stringify(arg)
		};
	},
	factorial: function(arg) {
		if (arg.type != "text") {
			return this.dataTypeError("factorial");
		}

		var input = new BigInteger(arg.value.toString(), 10);

		if (input.compareTo(BigInteger.ZERO) == -1) {
			return this.domainError("factorial");
		}

		var output = BigInteger.ONE;

		while (input.compareTo(BigInteger.ONE) != -1) {
			output = output.multiply(input);
			input = input.subtract(BigInteger.ONE);
		}

		return {
			"type": "text",
			"value": output.toString()
		};
	},
	sum: function(arg) {
		if (arg.type != "array") {
			if (arg.type == "text") {
				return arg;
			} else {
				return this.dataTypeError("sum");
			}
		}

		var input = arg;

		var output = BigInteger.ZERO;

		for (var i = 0; i < input.objects.length; i++) {
			output = output.add(new BigInteger(input.objects[i].value));
		}

		return {
			"type": "text",
			"value": output.toString()
		};
	},
	multiply: function(arg) {
		if (arg.type != "array") {
			if (arg.type == "text") {
				return arg;
			} else {
				return this.dataTypeError("multiply");
			}
		}

		var input = arg;

		var output = BigInteger.ONE;

		for (var i = 0; i < input.objects.length; i++) {
			output = output.multiply(new BigInteger(input.objects[i].value));
		}

		return {
			"type": "text",
			"value": output.toString()
		};
	},
	echo: function(arg) {
		return arg;
	},
	canvas: function(arg) {
		if (arg.type != "pixels") {
			return this.dataTypeError("canvas");
		}

		var object = arg;

		object.type = "canvas";

		var output = object;
		return output;
	},
	draw_pixels: function(arg) {
		if (arg.type != "array") {
			return this.dataTypeError("drawPixels");
		}

		var x_dim = parseInt(arg.objects[0].value);
		var y_dim = parseInt(arg.objects[1].value);

		var output = {
			"type": "pixels",
			"dimensions": {
				"x": x_dim,
				"y": y_dim
			},
			"pixels": []
		}

		for (var i = 2; i < arg.objects.length; i += 3) {
			output.pixels.push({
				"x": parseInt(arg.objects[i].value),
				"y": parseInt(arg.objects[i + 1].value),
				"color": arg.objects[i + 2].value
			});
		}

		return output;
	},
	mandelbrot: function(arg) {
		if (arg.type != "array") {
			return this.dataTypeError("mandelbrot");
		}

		var width = parseFloat(arg.objects[0].value);
		var height = parseFloat(arg.objects[1].value);

		var corners = [{
			real: parseFloat(arg.objects[2].value),
			imaginary: parseFloat(arg.objects[3].value)
		}, {
			real: parseFloat(arg.objects[4].value),
			imaginary: parseFloat(arg.objects[5].value)
		}];

		var color = function(c) {
			var iterations = 0;
			var z = {
				real: 0,
				imaginary: 0
			};
			while ((iterations <= 100) && (((z.real * z.real) + (z.imaginary * z.imaginary)) < 4)) {
				z = {
					real: ((z.real * z.real) - (z.imaginary * z.imaginary)) + c.real,
					imaginary: (2 * ((z.real) * (z.imaginary))) + c.imaginary
				};
				iterations++;
			}

			if (iterations > 100) {
				return "#000000";
			} else if (iterations >= 50) {
				return "#aaaaaa";
			} else if (iterations >= 20) {
				return "#bbbbbb";
			} else if (iterations >= 16) {
				return "#cccccc";
			} else if (iterations >= 14) {
				return "#dddddd";
			} else if (iterations >= 12) {
				return "#eeeeee";
			} else {
				return "#ffffff";
			}
		};

		var output = [{
			"type": "text",
			"value": width
		}, {
			"type": "text",
			"value": height
		}];

		for (var i = 0; i <= height; i++) {
			for (var r = 0; r <= width; r++) {
				output.push({
					"type": "text",
					"value": r
				});
				output.push({
					"type": "text",
					"value": i
				});
				output.push({
					"type": "text",
					"value": color({
						real: corners[0].real + (r * ((corners[1].real - corners[0].real) / width)),
						imaginary: corners[0].imaginary + (i * ((corners[1].imaginary - corners[0].imaginary) / height))
					})
				});
			}
		}

		return this.draw_pixels({
			"type": "array",
			"objects": output
		});
	},
	inject: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("inject");
		}
		if (arg.objects[0].type !== "placeholders") {
			return this.dataTypeError("inject");
		}
		if (arg.objects[1].type !== "executable constructor") {
			return this.dataTypeError("inject");
		}
		var placeholders = {};
		for (var i in arg.objects[0].placeholders) {
			placeholders[arg.objects[0].placeholders[i].name] = arg.objects[0].placeholders[i].value;
		}

		var output = {
			"type": "executable",
			"command": ""
		};
		for (var j in arg.objects[1].parts) {
			if (arg.objects[1].parts[j].type === "executable part") {
				output.command += arg.objects[1].parts[j].value;
			}
			if (arg.objects[1].parts[j].type === "get placeholder") {
				output.command += placeholders[arg.objects[1].parts[j].name].value;
			}
		}
		return output;
	},
	executable_constructor: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("executable_constructor");
		}
		return {
			"type": "executable constructor",
			"parts": arg.objects
		};
	},
	get_placeholder: function(arg) {
		if (arg.type !== "text") {
			return this.dataTypeError("get_placeholder");
		}
		return {
			"type": "get placeholder",
			"name": arg
		};
	},
	set_placeholder: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("set_placeholder");
		}
		return {
			"type": "set placeholder",
			"name": arg.objects[0],
			"value": arg.objects[1]
		}
	},
	placeholders: function(arg) {
		if (arg.type !== "array") {
			return {
				"type": "placeholders",
				"placeholders": [arg]
			};
		}
		return {
			"type": "placeholders",
			"placeholders": arg.objects
		}
	},
	executable_part: function(arg) {
		if (arg.type === "array") {
			return this.dataTypeError("executable_part");
		}
		return {
			"type": "executable part",
			"value": arg.value
		};
	},
	remainder: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("remainder");
		}
		return {
			"type": "text",
			"value": parseFloat(arg.objects[0].value) % parseFloat(arg.objects[1].value)
		}
	},
	greater_than: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("greater_than")
		}
		if (parseFloat(arg.objects[0].value) > parseFloat(arg.objects[1].value)) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	less_than: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("less_than")
		}
		if (parseFloat(arg.objects[0].value) < parseFloat(arg.objects[1].value)) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	greater_than_or_equal: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("greater_than_or_equal")
		}
		if (parseFloat(arg.objects[0].value) >= parseFloat(arg.objects[1].value)) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	less_than_or_equal: function(arg) {
		if (arg.type !== "array") {
			return this.dataTypeError("less_than_or_equal")
		}
		if (parseFloat(arg.objects[0].value) <= parseFloat(arg.objects[1].value)) {
			return {
				"type": "boolean",
				"value": true
			};
		} else {
			return {
				"type": "boolean",
				"value": false
			};
		}
	},
	help: function(arg) {
		if (arg.type != "text") {
			return this.dataTypeError("help");
		}

		var commands = {
			"factorial": {
				"description": "returns the factorial of the input",
				"argument": "non-negative integer",
				"example": "factorial(3)"
			},
			"draw_pixels": {
				"description": "draws specified pixels, requires canvas to display",
				"argument": "width,height,pixel-x,pixel-y,pixel-color,...",
				"example": "canvas(draw_pixels(20,20,5,5,red,4,4,blue))"
			},
			"mandelbrot": {
				"description": "draws a mandelbrot set, requires canvas to display",
				"argument": "width,height,top left complex number real part,top left complex number imaginary part,bottom right complex number real part,bottom right complex number imaginary part",
				"example": "canvas(mandelbrot(300,200,-2,1,1,-1))"
			},
			"canvas": {
				"description": "used to display pixels",
				"argument": "set of pixels",
				"example": "canvas(drawPixels(20,20,5,5,red,4,4,blue))"
			},
			"sum": {
				"description": "adds the input(s)",
				"argument": "integer,integer,...",
				"example": "sum(2,2)"
			},
			"multiply": {
				"description": "multiplies the input(s)",
				"argument": "integer,integer,...",
				"example": "multiply(2,3)"
			},
			"store": {
				"description": "stores text in a cookie",
				"argument": "variable name,text to store,[days cookie lasts]",
				"example": "store(myvariable,my stored text)"
			},
			"read": {
				"description": "returns stored text from a cookie",
				"argument": "variable name",
				"example": "read(myvariable)"
			},
			"list_cookies": {
				"description": "lists currently stored cookies",
				"argument": "",
				"example": "list_cookies()"
			},
			"raw_json": {
				"description": "shows the json text for an object",
				"argument": "object",
				"example": "raw_json(text)"
			},
			"finals_grade": {
				"description": "calculates grade you need to get on a final to achieve desired grade in class",
				"argument": "finals percent,current grade,desired grade",
				"example": "finals_grade(15,95,90)"
			},
			"get_bookmarklet": {
				"description": "gives you a link to bookmark so you can easily use this calculator",
				"argument": "",
				"example": "get_bookmarklet()"
			},
			"text": {
				"description": "simply returns the argument as text",
				"argument": "text",
				"example": "text(text here)"
			},
			"factor": {
				"description": "returns an array of the prime factors of the argument",
				"argument": "number",
				"example": "factor(10)"
			},
			"function": {
				"description": "returns an executable function",
				"argument": "function as text",
				"example": "function(echo\\(hello world\\))"
			},
			"execute": {
				"description": "runs an executable function",
				"argument": "function",
				"example": "execute(function(echo\\(hello world\\)))"
			},
			"equals": {
				"description": "tests if two objects are identical",
				"argument": "object,object",
				"example": "equals(1,1)"
			},
			"if": {
				"description": "returns an output depending on a condition (boolean)",
				"argument": "boolean,output if true,output if false",
				"example": "if(equals(1,1),condition is true,condition is false)"
			},
			"select": {
				"description": "select an object from an array or labeled_array",
				"argument": "index,array",
				"example": "select(1,echo(zero,one,two))"
			},
			"array": {
				"description": "encloses argument in an array",
				"argument": "object",
				"example": "array(text)"
			},
			"data": {
				"description": "returns a data set",
				"argument": "array,array,...",
				"example": "data(echo(1,2),echo(2,3),echo(4,5))"
			},
			"labeled_array": {
				"description": "returns a labeled array with the specified fields",
				"argument": "field name1,value1,field name2,value2,...",
				"example": "labeled_array(first,myfirstobject,second,mysecondobject)"
			},
			"true": {
				"description": "boolean true value",
				"argument": "",
				"example": "true()"
			},
			"false": {
				"description": "boolean false value",
				"argument": "",
				"example": "false()"
			},
			"meta": {
				"description": "add a property and value to an object",
				"argument": "property name,value,object",
				"example": "meta(plain_text(linebreaks),true(),labeled_array(first,myfirstobject,second,mysecondobject))"
			},
			"plain_text": {
				"description": "returns non-json plain text string value",
				"argument": "text",
				"example": "plain_text(text)"
			},
			"echo": {
				"description": "returns argument",
				"argument": "object",
				"example": "echo(hello world)"
			},
			"clear": {
				"description": "clears all outputs",
				"argument": "",
				"example": "clear()"
			},
			"help": {
				"description": "displays this help text",
				"argument": "[function name]",
				"example": "help()"
			}
		};

		var output = {
			"type": "lines",
			"lines": []
		};

		if (arg.value == "") {
			var command_names = Object.keys(commands);

			output.lines.push({
				"type": "seamless array",
				"objects": [{
					"type": "text",
					"value": "Type "
				}, {
					"type": "code",
					"value": "help(function name)"
				}, {
					"type": "text",
					"value": " for a more detailed explanation of the specified function."
				}]
			});
			output.lines.push({
				"type": "text",
				"value": ""
			});

			for (var i = 0; i < command_names.length; i++) {
				output.lines.push({
					"type": "seamless array",
					"objects": [{
						"type": "code",
						"value": command_names[i]
					}, {
						"type": "text",
						"value": " " + commands[command_names[i]].description
					}]
				});
			}
		} else {
			if (commands[arg.value]) {
				output.lines.push({
					"type": "seamless array",
					"objects": [{
						"type": "code",
						"value": arg.value + "(" + commands[arg.value].argument + ")"
					}, {
						"type": "text",
						"value": " " + commands[arg.value].description + ", example: "
					}, {
						"type": "code",
						"value": commands[arg.value].example
					}]
				});
			} else {
				output.lines.push({
					"type": "error",
					"message": "There is no help listing for the specified command.",
					"from": "help"
				});
			}
		}

		return output;
	}
};