var Peggy = require('../src/peggy.js').Peggy,
	Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("And rules", function(){
	
	var input = new Scanner("testing"), grammar = new Peggy('testGrammar');
	
	beforeEach(function(){
		input.reset();
	});

	it("should not consume input on success", function(){
		var rule = grammar.rule('ander', grammar.sequence(/test/, grammar.and(/ing/))),
			t = Engine.process(rule, input);
		expect(t).toBeDefined();
		// there should be 2 matches
		expect(t['0'].count).toEqual(2);
		// but the string should only be for the non-ander.
		expect(t['0'].string).toEqual('test');
	});
});