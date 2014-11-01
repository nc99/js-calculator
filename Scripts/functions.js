function factorial(args) {
        	var input = new BigInteger(args[0].toString(),10);
        	var output = BigInteger.ONE;

        	while (input.toString() !== "1") {
        		output = output.multiply(input);
        		input = input.subtract(BigInteger.ONE);
        	}

        	return output.toString();
        }

        function getPiDigits(input) {
        	var output = 0;
        	for (var i = 0; i <= input; i++) {
        		output = output + (Math.pow(16, -i)) * ( (4 / (8 * i + 1)) - (2 / (8 * i + 4)) - (1 / (8 * i + 5)) - (1 / (8 * i + 6)) );
        	}
        	return output;
        }

        function factor(input) {
            if (input != Math.round(input)) {
                setStatusMessage("Number to be factored must be an integer");
                return "Out of Domain";
            }

            var output = [];
        	
            if (input < 0) {
                output.push(-1);
                input = input * -1;
            }

            var possibleFactor = 2;
            var upperLimit = Math.round(Math.sqrt(input));

        	while (possibleFactor <= upperLimit) {
                if (input % possibleFactor == 0) {
                    if (isPrime(possibleFactor)) {
                        output.push(possibleFactor);
                    } else {
                        output.push(factor(possibleFactor));
                    }
                    if (isPrime(input / possibleFactor)) {
                        output.push(input / possibleFactor);
                    } else {
                        output.push(factor(input / possibleFactor));
                    }
                    return displayArray(output);
                } else {
                    if (possibleFactor == 2) {
                        possibleFactor--;
                    }
                    possibleFactor = possibleFactor + 2;
                }
            }

            output.push(input);

            return displayArray(output);
        }

        function displayArray(args) {
        	var output = "";

        	for (var i = 0; i < args.length; i++) {
        		if (i == 0) {
        			output = args[i];
        		} else {
        			output +=  "," + args[i]
        		}
        	}

        	return output;
        }

        function perfect(input) {
            return Math.pow(2, (input - 1)) * (Math.pow(2, input) - 1);
        }

        function isPrime(args) {
        	var input = args[0];

            if (factor(input) == [input]) {
            	return true;
            } else {
            	return false;
            }
        }

        function gamma(args) {
        	var input = args[0];

            // Constants
            var e = 2.7182818284590452353602874713526624977572;
            var y = 0.5772156649015328606065120900824024310421;

            // Calculate Gamma
            var output = Math.pow(e, (-1 * y * input)) / input;
            for (var n = 1; n <= 100000; n++) {
                output = output * Math.pow((1 + (input / n)), -1) * Math.pow(e, (input / n));
            }
            return output;
        }

        function calculateE(args) {
            var output = 0;
            for (var i = 0; i <= args[0]; i++) {
                output = output + (1 / (parseInt(factorial(i))));
            }
            return output;
        }

        function sum(args) {
            var output = 0;
            for (var i = 0; i < args.length; i++) {
                output = output + parseInt(args[i]);
            }
            return output;
        }

        function toBase10(input) {
        	return new BigInteger(input[0], input[1]).toString();
        }

        function sn(args) {
        	var input = args[0];
        	var precision = args[1];
        	var output = "";

        	var inputChars = input.split("");

        	for (var i = 0; (i < inputChars.length) && (i < (precision - 1)); i++) {
        		output = output + inputChars[i];
        		if (i == 0) {
        			output = output + ".";
        		}
        	}

        	if (i < inputChars.length) {
        		if (parseInt(inputChars[i + 1]) > 4) {
        			// Round up
        			output = output + (parseInt(inputChars[i]) + 1);
        		} else {
        			// Round down
        			output = output + inputChars[i];
        		}
        	}

        	return output + " x 10^" + inputChars.length;
        }

        function help(args) {
        	var commands = [
                {"name":"factorial","arguments":["n"],"description":"factorial of non-negative integer n"},
                {"name":"pi","arguments":["accuracy"],"description":"calculates pi using the BBP formulai and the specified accuracy"},
                {"name":"factor","arguments":["n"],"description":"completely factors integer n"},
                {"name":"perfect","arguments":["n"],"description":"uses a formula to calculate a possible perfect number"},
                {"name":"isPrime","arguments":["p"],"description":"inefficiently tests if p is prime"},
                {"name":"gamma","arguments":["n"],"description":"returns an approximation of the gamma of real number n"},
                {"name":"e","arguments":["accuracy"],"description":"calculates e to the specified accuracy"},
                {"name":"sum","arguments":["addend","addend","..."],"description":"returns the sum of all the addends"},
                {"name":"toBase10","arguments":["number","base"],"description":"changes the input number in the specified base to base 10"},
                {"name":"sn","arguments":["number","significant figures"],"description":"expresses an integer in scientific notation with specified number of significant figures"},
                {"name":"drawPixels","arguments":["width","height","pixel-x","pixel-y","pixel-color","pixel-x","pixel-y","pixel-color","..."],"description":"draws the pixels on the screen"},
                {"name":"mandelbrot","arguments":["width","height"],"description":"draws a mandelbrot set from (-2+1i) to (1-1i)"},
                {"name":"clear","arguments":[],"description":"clears the output space"},
            ];

        	var output = {"type":"plaintext","lines":[]};

            for (var i = 0; i < commands.length; i++) {
                output.lines.push(commands[i].name + "(" + commands[i].arguments + "): " + commands[i].description);
            }

        	return output;
        }

        function drawPixels(args) {
            var output = {
                "type":"pixels",
                "dimensions":{"x":args[0],"y":args[1]},
                "pixels":[]
            }

            for (var i = 2; i < args.length; i += 3) {
                output.pixels.push({"x":args[i],"y":args[i + 1],"color":args[i + 2]});
            }

            return output;
        }

        function mandelbrot(args) {
            var output = [];

            output[0] = args[0];
            output[1] = args[1];

            if (args.length < 11) {
                args[2] = "000000";
                args[3] = "888888";
                args[4] = "999999";
                args[5] = "aaaaaa";
                args[6] = "bbbbbb";
                args[7] = "cccccc";
                args[8] = "dddddd";
                args[9] = "eeeeee";
                args[10] = "ffffff";
            }

            var c = {"real":-2,"imaginary":1};

            while ((c.real < 1) && (c.imaginary > -1)) {
                var iterations = mandelbrotTest([c]);

                output.push((output[0] - (output[0] / 3)) + ((output[0] / 3) * c.real));
                output.push((output[1] - (output[1] / 2)) - ((output[1] / 2) * c.imaginary));

                if (iterations > 100) {
                    output.push(args[2]);
                } else if (iterations >= 16) {
                    output.push(args[3]);
                } else if (iterations >= 12) {
                    output.push(args[4]);
                } else if (iterations >= 10) {
                    output.push(args[5]);
                } else if (iterations >= 8) {
                    output.push(args[6]);
                } else if (iterations >= 6) {
                    output.push(args[7]);
                } else if (iterations >= 4) {
                    output.push(args[8]);
                } else if (iterations >= 2) {
                    output.push(args[9]);
                } else if (iterations >= 0) {
                    output.push(args[10]);
                } else {
                    output.push("ffffff");
                }

                c.real += (3 / output[0]); 

                if (c.real >= 1) {
                    c.imaginary += (-1 * (2 / output[1]));
                    c.real = -2;
                }
            }

            return drawPixels(output);
        }

        function mandelbrotTest(args) {
            var iterations = 0;

            var x = {"real":0,"imaginary":0};

            while (true) {
                if ((mendelbrotOperation([x,args[0]]).real > 2) || (mendelbrotOperation([x,args[0]]).imaginary > 2)) {
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

