var Peggy = require('../src/peggy.js').Peggy;

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
	// TODO: Fulfill tests for all JS object types
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
});
