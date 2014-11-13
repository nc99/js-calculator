function dataTypeError(arg) {
    return {"type":"error","message":"Unnacceptable data input type","from":arg};
}
function domainError(arg) {
    return {"type":"error","message":"Out of domain","from":arg};
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

    var canvas = document.createElement("canvas");

    canvas.setAttribute("width",object.dimensions.x * 1);
    canvas.setAttribute("height",object.dimensions.y * 1);
    canvas.setAttribute("style","border:1px solid #eeeeee;");

    for (var i = 0; i < object.pixels.length; i++) {
        canvas.getContext("2d").fillStyle = object.pixels[i].color;
        canvas.getContext("2d").fillRect(object.pixels[i].x * 1,object.pixels[i].y * 1,1,1);
    }

    var output = {
        "type":"canvas",
        "canvas":canvas
    }

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
        {"name":"mandelbrot","arguments":["width","height"],"description":"draws a mandelbrot set from (-2+1i) to (1-1i)"},
        {"name":"canvas","arguments":["pixels"],"description":"returns a canvas of the pixels"},
        {"name":"png","arguments":["pixels"],"description":"returns a png image of the pixels"},
        {"name":"sum","arguments":["addends","..."],"description":"returns sum of the addends"},
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

function mandelbrot(arg) {alert("hello francis");
    if (arg.type != "array") {
        return dataTypeError("mandelbrot");
    }

    var input = arg;
    var output = [];

    var x_dim = parseInt(input.objects[0].value);
    var y_dim = parseInt(input.objects[1].value);

    var corner = [];
    corner[0] = {"real":parseInt(input.objects[2]),"imaginary":parseInt(input.objects[3])};
    corner[1] = {"real":parseInt(input.objects[4]),"imaginary":parseInt(input.objects[5])};

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

    var c = corner[0];
    
    while ((c.real < corner[1].real) && (c.imaginary > corner[1].imaginary)) {
        var iterations = mandelbrotTest([c]);

        output.push(createText((x_dim - (x_dim / (corner[0].real - corner[1].real))) + ((x_dim / (corner[0].real - corner[1].real)) * c.real)));
        output.push(createText((y_dim - (y_dim / (corner[0].imaginary - corner[1].imaginary))) - ((y_dim / (corner[0].imaginary - corner[1].imaginary)) * c.imaginary)));

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

        c.real += ((corner[0].real - corner[1].real) / x_dim); 

        if (c.real >= corner[1].real) {
            c.imaginary += (corner[1].imaginary * ((corner[0].imaginary - corner[1].imaginary) / y_dim));
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

