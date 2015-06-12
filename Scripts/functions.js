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
    evaluate: function(arg) {
        if (arg.type !== "function") {
            return this.dataTypeError("executeFunction");
        }
        return evaluateNestedFunctions(preprocess(arg.command));
    },
    function: function(arg) {
        if (arg.type !== "text") {
            return this.dataTypeError("createFunction");
        }
        return {
            "type": "function",
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
    if : function(arg) {
        if (arg.objects[0].type !== "boolean") {
            return this.dataTypeError("condition_if");
        }

        if (arg.objects[0].value === true) {
            return arg.objects[1];
        } else {
            return arg.objects[2];
        }
    },
    equals: function(arg) {
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

        var createText = function(args) {
            return {
                "type": "text",
                "value": (args + "")
            };
        };
        var mandelbrotTest = function(args) {
            var iterations = 0;

            var x = {
                "real": 0,
                "imaginary": 0
            };

            while (true) {
                if ((mendelbrotOperation([x, args[0]]).real > 1000) || (mendelbrotOperation([x, args[0]]).imaginary > 1000)) {
                    return iterations;
                } else if (iterations > 100) {
                    return iterations;
                } else {
                    iterations++;
                    x = mendelbrotOperation([x, args[0]]);
                }
            }
        };
        var mendelbrotOperation = function(args) {
            var real = ((args[0].real * args[0].real) - (args[0].imaginary * args[0].imaginary) + args[1].real);
            var imaginary = ((2 * (args[0].real * args[0].imaginary)) + args[1].imaginary);
            return {
                "real": real,
                "imaginary": imaginary
            };
        };

        var input = arg;
        var output = [];

        var x_dim = parseInt(input.objects[0].value);
        var y_dim = parseInt(input.objects[1].value);

        var corner = [];
        corner[0] = {
            "real": parseInt(input.objects[2].value),
            "imaginary": parseInt(input.objects[3].value)
        };
        corner[1] = {
            "real": parseInt(input.objects[4].value),
            "imaginary": parseInt(input.objects[5].value)
        };

        output[0] = createText(input.objects[0].value);
        output[1] = createText(input.objects[1].value);

        var colors = [];

        if (colors.length < 9) {
            colors[0] = createText("#000000");
            colors[1] = createText("#888888");
            colors[2] = createText("#999999");
            colors[3] = createText("#aaaaaa");
            colors[4] = createText("#bbbbbb");
            colors[5] = createText("#cccccc");
            colors[6] = createText("#dddddd");
            colors[7] = createText("#eeeeee");
            colors[8] = createText("#ffffff");
        }

        var c = {
            "real": corner[0].real,
            "imaginary": corner[0].imaginary
        };

        while ((c.real < corner[1].real) && (c.imaginary > corner[1].imaginary)) {
            var iterations = mandelbrotTest([c]);

            output.push(createText((x_dim - (x_dim / Math.abs(corner[0].real - corner[1].real))) + ((x_dim / Math.abs(corner[0].real - corner[1].real)) * c.real)));
            output.push(createText((y_dim - (y_dim / Math.abs(corner[0].imaginary - corner[1].imaginary))) - ((y_dim / Math.abs(corner[0].imaginary - corner[1].imaginary)) * c.imaginary)));

            if (iterations > 100) {
                output.push(colors[0]);
            } else if (iterations >= 50) {
                output.push(colors[1]);
            } else if (iterations >= 20) {
                output.push(colors[2]);
            } else if (iterations >= 16) {
                output.push(colors[3]);
            } else if (iterations >= 14) {
                output.push(colors[4]);
            } else if (iterations >= 12) {
                output.push(colors[5]);
            } else if (iterations >= 10) {
                output.push(colors[6]);
            } else if (iterations >= 8) {
                output.push(colors[7]);
            } else {
                output.push(colors[8]);
            }

            c.real += (Math.abs(corner[0].real - corner[1].real) / x_dim);

            if (c.real >= corner[1].real) {
                c.imaginary += (-1 * ((Math.abs(corner[0].imaginary - corner[1].imaginary) / y_dim)));
                c.real = corner[0].real;
            }
        }

        return drawPixels({
            "type": "array",
            "objects": output
        });
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
            "drawPixels": {
                "description": "draws specified pixels, requires canvas to display",
                "argument": "width,height,pixel-x,pixel-y,pixel-color,...",
                "example": "canvas(drawPixels(20,20,5,5,red,4,4,blue))"
            },
            "mandelbrot": {
                "description": "draws a mandelbrot set, requires canvas to display",
                "argument": "width,height,-2,1,1,-1",
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