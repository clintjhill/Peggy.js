var Peggy = require('../src/peggy.js').Peggy,
	util = require('util');

var ruleBuilder, terminal, stringTerminal, nonTerminal,
	sequence, repeat, alias, choice;

beforeEach(function(){
	ruleBuilder = new Peggy("rule builder");
	terminal = ruleBuilder.rule("terminal", /\w+/);
	stringTerminal = ruleBuilder.rule("stringTerminal", "hello");
	nonTerminal = ruleBuilder.rule("nonTerminal", ruleBuilder.sequence(/\s/,/\w/));
	sequence = ruleBuilder.rule("sequence", ruleBuilder.sequence(/\s/,/\w/));
	repeat = ruleBuilder.rule("repeat", ruleBuilder.repeat(":sequence", 1));
	alias = ruleBuilder.rule("alias", ":repeat");
	choice = ruleBuilder.rule("choice", ruleBuilder.choice(":alias", ":sequence"));
});

describe("Peggy instantiation", function(){
	it("should throw on bad grammar name", function(){
		expect(function(){
			var p = new Peggy();
		}).toThrow("A grammar name is required");
	});
	it("should initialize 0 rules", function(){
		var p = new Peggy("test rules");
		expect(p.rules.count).toEqual(0);
	});
	it("should set name", function(){
		var p = new Peggy("test name");
		expect(p.name).toEqual("test name");
	});
});

describe("Peggy type system", function(){
	it("should recognize objects", function(){
		expect(Peggy.type({})).toEqual("object");
	});
	it("should recognize arrays", function(){
		expect(Peggy.type([])).toEqual("array");
	});
	it("should recognize strings", function(){
		expect(Peggy.type("")).toEqual("string");
	});
	it("should recognize regexes", function(){
		expect(Peggy.type(/\w/)).toEqual("regexp");
	});
	it("should recognize numbers", function(){
		expect(Peggy.type(3)).toEqual("number");
	});
});

describe("Peggy rule type system", function(){
	it("should recognize RegExp as 'terminal'", function(){
		expect(Peggy.ruleType(/\s/)).toEqual("terminal");
	});
	// This test is simply checking that arrays with a type
	// property return the type value.
	it("should recognize array as 'nonTerminal' types", function(){
		var sequence = [];
		sequence.type = 'sequence';
		expect(Peggy.ruleType(sequence)).toEqual("sequence");
	});
	it("should recognized strings as 'stringTerminal'", function(){
		expect(Peggy.ruleType("")).toEqual("stringTerminal");
	});
	it("should recognize strings preceded by colons as 'alias'", function(){
		expect(Peggy.ruleType(":clint")).toEqual("alias");
	});
});

describe("Peggy rule building", function(){

	it("should provide a 'root' declaration", function(){
		var root = new Peggy("root test");
		root.root('test');
		expect(root.rules['root']).toBeDefined();
		expect(root.root).toBeDefined();
	});
	
	it("should build rules", function(){
		var rule = ruleBuilder.rule("terminal", /\w+/);
		expect(rule.grammar).toEqual(ruleBuilder);
		expect(rule.name).toEqual('terminal');
		expect(rule.type).toEqual('terminal');
		expect(rule.declaration).toEqual(/\w+/);
		expect(rule.isTerminal).toBeTruthy();
		expect(rule.extension).toBeUndefined();
	});

	it("should set isTerminal properly", function(){
		expect(terminal.isTerminal).toBeTruthy();
		expect(stringTerminal.isTerminal).toBeTruthy();
		expect(nonTerminal.isTerminal).toBeFalsy();
	});

	it("should recognize rule type", function(){
		expect(terminal.type).toEqual('terminal');
		expect(stringTerminal.type).toEqual('stringTerminal');
		expect(sequence.type).toEqual('sequence');
		expect(repeat.type).toEqual('repeat');
		expect(alias.type).toEqual('alias');
		expect(choice.type).toEqual('choice');
	});
});

describe("Peggy rule resolution", function(){
	
	it("should resolve normal names", function(){
		var normal = ruleBuilder.resolveAlias("terminal");
		expect(normal).toBeDefined();
		expect(normal).toEqual(terminal);
	});

	it("should resolve alias names", function(){
		var aliased = ruleBuilder.resolveAlias(":alias");
		expect(aliased).toBeDefined();
		expect(aliased).toEqual(alias);
	});

});
