var Peggy = require('../src/peggy.js').Peggy,
	Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("Not rules", function(){
	
	var input = new Scanner("testing"), grammar = new Peggy('testGrammar');
	
	beforeEach(function(){
		input.reset();
	});

	it("should not consume input on success", function(){
		var rule = grammar.rule('noter', grammar.sequence(/test/, grammar.not(/a/), /ing/)),
			t = Engine.process(rule, input);
		expect(t).toBeDefined();
		// there should be 3 matches
		expect(t['0'].count).toEqual(3);
		// but the string should only be for the non-noter.
		expect(t['0'].string).toEqual('testing');
	});
});