importScripts("jsbn/jsbn.js");
importScripts("jsbn/jsbn2.js");

function dataTypeError(arg) {
    return {"type":"error","message":"Unnacceptable data input type","from":arg};
}
function domainError(arg) {
    return {"type":"error","message":"Out of domain","from":arg};
}

var stored_objects = {};
function store(arg) {
    if (arg.type != "array") {
        return dataTypeError("store");
    }

    stored_objects[arg.objects[1].value] = arg.objects[0];
    return {"type":"text","value":"Object stored."};
}

function read(arg) {
    if (arg.type != "text") {
        return dataTypeError("read");
    }

    return stored_objects[arg.value];
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
    return arg;
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
    var commands = [
        {"name":"factorial","arguments":["n"],"description":"factorial of non-negative integer n"},
        {"name":"drawPixels","arguments":["width","height","pixel-x","pixel-y","pixel-color","pixel-x","pixel-y","pixel-color","..."],"description":"draws the pixels on the screen"},
        {"name":"mandelbrot","arguments":["width","height","a","b","c","d"],"description":"draws a mandelbrot set from (a+bi) to (c+di)"},
        {"name":"canvas","arguments":["pixels"],"description":"returns a canvas of the pixels"},
        {"name":"png","arguments":["pixels"],"description":"returns a png image of the pixels"},
        {"name":"sum","arguments":["addends","..."],"description":"returns sum of the addends"},
        {"name":"store","arguments":["object","location"],"description":"stores an object to the location name, can be retrieved with 'read' command"},
        {"name":"read","arguments":["location"],"description":"retrieves stored object from the specified location"},
        {"name":"clear","arguments":[],"description":"clears the output space"},
    ];

    var output = {"type":"linedtext","lines":[]};

    for (var i = 0; i < commands.length; i++) {
        output.lines.push(createText(commands[i].name + "(" + commands[i].arguments + "): " + commands[i].description));
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

