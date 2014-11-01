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
        	var commands = [["factorial","does stuff"],["pi","does stuff"]];

        	var output = [];

        	for (var i = 0; i < commands.length; i++) {
        		output.push(commands[i][0] + ": " + commands[i][1]);
        	}

        	return output;
        }