var Peggy = require('../src/peggy.js').Peggy,
	Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("Repeat rules", function(){		

	var input = new Scanner("testing"), grammar = new Peggy('testGrammar');
	
	beforeEach(function(){
		input.reset();
	});

	it("should return on proper matches (min/max)", function(){
		var rule = grammar.rule("repeat", grammar.repeat(/\w/, 1, 5)),
			t = Engine.process(rule, input);
		expect(t).toBeDefined();
		expect(t['0']).toBeDefined();
		expect(t['0'].count).toEqual(5);
		expect(t['0'].match).toEqual("testi");
	});

	it("should not be infinite loop", function(){
		var rule = grammar.rule('infinite', grammar.repeat(/./)),
			t = Engine.process(rule, input);
		expect(t).toBeDefined();
		expect(t['0'].count).toEqual(7);
		expect(t['0'].match).toEqual('testing');
	});
});
