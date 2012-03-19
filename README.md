Peggy.js - A simpler PEG generator in JavaScript
======================================

Peggy.js is a Parsing Expression Grammar (PEG) generator that is designed to be small and easy-to-use.

A Parsing Expression Grammar (PEG) is used to create a set of rules from which you can parse string values. The result of this parse is to create a single tree of values as it matches the rules within the grammar.

See Also: [Parsing Expression Grammar](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

With Peggy.js there are two ways to create a PEG:

* Peggy JavaScript API
* Peggy Syntax

### Peggy JavaScript API ###

To create a grammar begin with the Peggy constructor.
	
	var sample = new Peggy('additive');

Now you can build rules from that grammar with the following API.

	sample.rule(name, declaration, extension);

To create the top of the parsing tree (the initial starting expression) use the `root` function.

	sample.root(name, declaration, extension);
	
The `declaration` parameter of `root` and `rule` functions can be a string, regular expression or an alias to another rule in the grammar. The `extension` parameter is a function used to evaluate the value of the matched string of the rule.
	
	// Root rule being set and an example of supplying an extension to evaluate the value
	// As well the root uses a sequence of aliases to other rules within the grammar
	sample.root('additive', sample.sequence(':number', ':plus', ':number'), function(value){
		return value.number[0] + value.number[1];
	});
	
	// example of using a Regular Expression as the declaration of the rule
	sample.rule('number', /\d+/, function(value){ 
		return new Number(value); 
	});
	
	// example of using a string as the declaration of the rule
	sample.rule('number', '+');
	
With rules set against the grammar you can now parse strings.

	var result = sample.parse('6+6');	
	// result is 12


### Peggy Syntax ###

To create a grammar named 'demo' you could write the following Peggy syntax.
(Note: This is proposal and not implemented. There is no Peggy grammar included yet. See Roadmap.)

	demo = {
		additive: (:number, :plus, :number){
			return value.number[0] + value.number[1];
		},
		number: (:digit, :space){
			return value.digit;
		},
		plus: ('+', :space),
		digit: (/\d+/, :space){
			return new Number(value[0]);
		},
		space: /\s+/
	}

#### Breakdown of Peggy Syntax ####

Using the demo grammar above the following are definitions of the components of Peggy syntax.

**Grammar:** `demo`
The name of this set of rules.

**Rule:** `additive`
A single rule name.

**Non-Terminal:** `(:number, :plus, :number)`
A Non-Terminal definition of a rule. In this case a Sequence. Repeat and Choice Non-Terminals are also available.

**Terminal:** `/\d+/`
A Terminal definition, simply a singular term from the content of the parsing. Can be a string or a regular expression.

**Alias:** `:number`
A name to apply to another rule within the grammar.

**Extension:** `{ return new Number(value[0]); }`
A JavaScript block of code to execute that is provided a Value object. 

**Value:** `value[0]`
A Value object that is the result of the expression evaluation.

### Examples ###

Open these files in a browser to run a few sample grammars. Each demonstrates the ability to create a grammar through the Peggy JavaScript API. They are progressively built, so starting with the Additive Easy example you will see a very small and naive implementation and build on that for Simplified and Full. 

* [Additive Easy](examples/additive-easy.html)
* [Additive Simplified](examples/additive-simplified.html)
* [Additive Full](examples/additive-full.html)


Developers
----------

#### Building Peggy.js ####

`make` : creates both a peggy.js and a peggy-min.js file inside of a /dist directory

`make lint` : tests the source of Peggy.js against JSLint

`make spec` : run tests in /specs directory

`make clean` : deletes the /dist directory

### Requirements to build and run tests

1. GNU Make
2. [Node.js](http://nodejs.org/) 0.5.0 or greater
3. [Node.js Package Manager](http://npmjs.org/) 1.0.0 or greater
4. jasmine-node `npm install -g jasmine-node`

Roadmap
-------

1. (Done) Finish API with Repeat, And, But etc. 
2. (Done) Better parse exception handling on missed rule and/or tree inconsistencies.
3. Full line/character error messages.
4. Peggy grammar to allow for building rules with a Peggy syntax instead of the JavaScript API.
5. (Done) More testing.
6. More samples of both Peggy syntax and API.
7. (Done) Fully embed string scanner (maybe even optimize for use case).
8. Improve the value object that is returned to rule extensions.
9. Improve example pages - construct a tutorial.
