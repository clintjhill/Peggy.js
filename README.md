Peggy.js - A simpler PEG in JavaScript
======================================

Introduction
------------

Peggy.js is a Parsing Expression Grammar.

Description
-----------

Parsing Expression Grammars in layman's terms are used to create a grammar (set of rules) from 
which you can parse string values. The result of this parse is to create a single tree of the
string as it matches the rules within the grammar.

See Also: [Parsing Expression Grammar](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

Peggy Syntax
------------

To create a grammar named 'demo' you could write the following Peggy syntax.
(Note: This is proposal and not implemented. There is no file grammar included yet. See Roadmap.)

	demo = {
		additive: (:number, :plus, :number){
			return value['number'][0] + value['number'][2];
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

### Breakdown of Peggy Syntax ###
Using the demo grammar above the following are definitions of the components of Peggy syntax.

**Grammar:** `demo`
The name of this set of rules.

**Rule:** `additive`
A single rule name.

**Non-Terminal:** `(:number, :plus, :number)`
A Non-Terminal definition of a rule. In this case a Sequence. Choices are also available.

**Terminal:** `/\d+/`
A Terminal definition, simply a singular term from the content of the parsing.

**Alias:** `:number`
A name to apply to another rule within the grammar.

**Extension:** `{ return new Number(value[0]); }`
A JavaScript block of code to execute that is provided a Value object. 

**Value:** `value[0]`
A Value object that is the result of the expression evaluation.

Examples
--------

TODO

See More: [Examples Source](./examples)

Build
-----

`make` : creates both a peggy.js and a peggy-min.js file inside of a /dist directory

`make lint` : tests the source of Peggy.js against JSLint

`make clean` : deletes the /dist directory

### Requirements to build
1. GNU Make
2. Node 0.5.0 or greater

Roadmap
-------

1. Finish API with Repeat, And, But etc. 
2. Better parse exception handling on missed rule and/or tree inconsistencies.
3. Full line/character error messages.
4. File grammar to allow for building rules with a Peggy syntax instead of the API.
5. More testing.
6. More samples of both Peggy syntax and API.
7. Fully embed string scanner (maybe even optimize for use case).
8. Improve the value object that is returned to rule extensions.