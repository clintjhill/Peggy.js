var Scanner = Peggy.StringScanner,
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
		expect(t.count).toEqual(5);
	});

	it("should not be infinite loop", function(){
		var rule = grammar.rule('infinite', grammar.repeat(/\w/)),
			t = Engine.process(rule, input);
		expect(t).toBeDefined();
		expect(t.count).toEqual(7);
	});
});
