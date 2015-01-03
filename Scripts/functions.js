importScripts("jsbn/jsbn.js");
importScripts("jsbn/jsbn2.js");

function dataTypeError(arg) {
    return {"type":"error","message":"Incorrect data input type","from":arg};
}
function domainError(arg) {
    return {"type":"error","message":"Out of domain","from":arg};
}

function get_bookmarklet(arg) {
    return {"type":"link","value":"Drag me to your bookmarks bar","href":"javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://nicolaschan.com/js-calculator/Bookmarklet/bookmarklet.js';})();"};
}

function finals_grade(arg) {
    if (arg.type != "array") {
        return dataTypeError("finals_grade");
    }
    
    var finals_percent = parseFloat(arg.objects[0].value) / 100;
    var current_grade = parseFloat(arg.objects[1].value);
    var desired_grade = parseFloat(arg.objects[2].value);
    
    var required_finals_grade = (desired_grade - ((1 - finals_percent) * (current_grade))) / (finals_percent);
    return {"type":"text","value":required_finals_grade};
}

function list_cookies(arg) {
	if (arg.type != "text") {
        return dataTypeError("list_cookies");
    }
    return {"type":"list cookies"};
}


function store(arg) {
    if (arg.type != "array") {
        return dataTypeError("store");
    }

    if ((arg.objects[0].type != "text") || (arg.objects[1].type != "text")) {
    	return dataTypeError("store");
    }

    if (arg.objects[2]) {
    	return {"type":"set cookie","name":arg.objects[0].value,"value":arg.objects[1].value,"expires":parseInt(arg.objects[2].value)};
    } else {
    	return {"type":"set cookie","name":arg.objects[0].value,"value":arg.objects[1].value,"expires":1};
    }
}

function read(arg) {
    if (arg.type != "text") {
        return dataTypeError("read");
    }

    return {"type":"read cookie","name":arg.value};
}

function object_to_text(arg) {
    return {"type":"text","value":JSON.stringify(arg)};
}

function factorial(arg) {
    if (arg.type != "text") {
        return dataTypeError("factorial");
    }

    var input = new BigInteger(arg.value.toString(),10);

    if (input.compareTo(BigInteger.ZERO) == -1) {
        return domainError("factorial");
    }

    var output = BigInteger.ONE;

    while (input.compareTo(BigInteger.ONE) != -1) {
        output = output.multiply(input);
        input = input.subtract(BigInteger.ONE);
    }

    return {"type":"text","value":output.toString()};
}

function sum(arg) {
    if (arg.type != "array") {
        if (arg.type == "text") {
            return arg;
        } else {
            return dataTypeError("sum");
        }
    }

    var input = arg;

    var output = BigInteger.ZERO;

    for (var i = 0; i < input.objects.length; i++) {
        output = output.add(new BigInteger(input.objects[i].value));
    }

    return {"type":"text","value":output.toString()};
}

function multiply(arg) {
    if (arg.type != "array") {
        if (arg.type == "text") {
            return arg;
        } else {
            return dataTypeError("multiply");
        }
    }

    var input = arg;

    var output = BigInteger.ONE;

    for (var i = 0; i < input.objects.length; i++) {
        output = output.multiply(new BigInteger(input.objects[i].value));
    }

    return {"type":"text","value":output.toString()};
}

function testing(arg) {
    return {"type":"read cookie","name":"bob","value":"hello there","expires":1};
}

function createText(args) {
    return {"type":"text","value":(args + "")};
}

function canvas(arg) {
    if (arg.type != "pixels") {
        return dataTypeError("canvas");
    }

    var object = arg;

    object.type = "canvas";

    var output = object;
    return output;
}

function png(arg) {
    if (arg.type != "pixels") {
        return dataTypeError("png");
    }

    var object = arg;

    var canvas = document.createElement("canvas");

    canvas.setAttribute("width",object.dimensions.x * 1);
    canvas.setAttribute("height",object.dimensions.y * 1);
    canvas.setAttribute("style","border:1px solid #eeeeee;");

    for (var i = 0; i < object.pixels.length; i++) {
        canvas.getContext("2d").fillStyle = object.pixels[i].color;
        canvas.getContext("2d").fillRect(object.pixels[i].x * 1,object.pixels[i].y * 1,1,1);
    }

    var img = document.createElement("img");
    img.setAttribute("src",canvas.toDataURL("image/png"));
    img.setAttribute("width",object.dimensions.x);
    img.setAttribute("height",object.dimensions.y);

    var output = {
        "type":"png",
        "image":img
    };

    return output;
}

function help(arg) {
    if (arg.type != "text") {
        return dataTypeError("help");
    }

    var commands = {
        "factorial":{"description":"returns the factorial of the input","argument":"non-negative integer","example":"factorial(3)"},
        "drawPixels":{"description":"draws specified pixels","argument":"width,height,pixel-x,pixel-y,pixel-color,...","example":"drawPixels(20,20,5,5,red,4,4,blue)"},
        "mandelbrot":{"description":"draws a mandelbrot set","argument":"width,height,-2,1,1,-1","example":"mandelbrot(300,200,-2,1,1,-1)"},
        "canvas":{"description":"used to display pixels","argument":"set of pixels","example":"canvas(drawPixels(20,20,5,5,red,4,4,blue))"},
        "sum":{"description":"adds the input(s)","argument":"integer,integer,...","example":"sum(2,2)"},
        "multiply":{"description":"multiplies the input(s)","argument":"integer,integer,...","example":"multiply(2,3)"},
        "finals_grade":{"description":"calculates grade you need to get on a final to achieve desired grade in class","argument":"finals percent,current grade,desired grade","example":"finals_grade(15,95,90)"},
        "get_bookmarklet":{"description":"gives you a link to bookmark so you can easily use this calculator","argument":"","example":"get_bookmarklet()"}
    };

    var output = {"type":"lines","lines":[]};

    if (arg.value == "") {
        var command_names = Object.keys(commands);

        output.lines.push({"type":"seamless array","objects":[{"type":"text","value":"Type "},{"type":"code","value":"help(function name)"},{"type":"text","value":" for a more detailed explanation of the specified function."}]});
        output.lines.push({"type":"text","value":""});

        for (var i = 0; i < command_names.length; i++) {
            output.lines.push({"type":"seamless array","objects":[{"type":"code","value":command_names[i]},{"type":"text","value":" " + commands[command_names[i]].description}]});
        }
    } else {
        if (commands[arg.value]) {
            output.lines.push({"type":"seamless array","objects":[{"type":"code","value":arg.value + "(" + commands[arg.value].argument + ")"},{"type":"text","value":" " + commands[arg.value].description + ", example: "},{"type":"code","value":commands[arg.value].example}]});
        } else {
            output.lines.push({"type":"error","message":"There is no help listing for the specified command.","from":"help"});
        }
    }

    return output;
}

function drawPixels(arg) {
    if (arg.type != "array") {
        return dataTypeError("drawPixels");
    }

    var x_dim = parseInt(arg.objects[0].value);
    var y_dim = parseInt(arg.objects[1].value);

    var output = {
        "type":"pixels",
        "dimensions":{"x":x_dim,"y":y_dim},
        "pixels":[]
    }

    for (var i = 2; i < arg.objects.length; i += 3) {
        output.pixels.push({"x":parseInt(arg.objects[i].value),"y":parseInt(arg.objects[i + 1].value),"color":arg.objects[i + 2].value});
    }

    return output;
}

function mandelbrot(arg) {
    if (arg.type != "array") {
        return dataTypeError("mandelbrot");
    }

    var input = arg;
    var output = [];

    var x_dim = parseInt(input.objects[0].value);
    var y_dim = parseInt(input.objects[1].value);

    var corner = [];
    corner[0] = {"real":parseInt(input.objects[2].value),"imaginary":parseInt(input.objects[3].value)};
    corner[1] = {"real":parseInt(input.objects[4].value),"imaginary":parseInt(input.objects[5].value)};

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
    
    var c = {"real":corner[0].real,"imaginary":corner[0].imaginary};

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

    return drawPixels({"type":"array","objects":output});
}

        function mandelbrotTest(args) {
            var iterations = 0;

            var x = {"real":0,"imaginary":0};

            while (true) {
                if ((mendelbrotOperation([x,args[0]]).real > 1000) || (mendelbrotOperation([x,args[0]]).imaginary > 1000)) {
                    return iterations;
                } else if (iterations > 100) {
                    return iterations;
                } else {
                    iterations++;
                    x = mendelbrotOperation([x,args[0]]);
                }
            }
        }

        function mendelbrotOperation(args) {
            var real = ((args[0].real * args[0].real) - (args[0].imaginary * args[0].imaginary) + args[1].real);
            var imaginary = ((2 * (args[0].real * args[0].imaginary)) + args[1].imaginary);
            return {"real":real,"imaginary":imaginary};
        }

