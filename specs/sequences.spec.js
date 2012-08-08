var Peggy = require('../src/peggy.js').Peggy,
	Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("Sequence rules", function(){

	var input = new Scanner("testing"), grammar = new Peggy('testGrammar');
	
	beforeEach(function(){
		input.reset();
	});

	it("should return only when full sequence matched", function(){
		var rule = grammar.rule('sequence', grammar.sequence(/t/,/e/,/st/,/i/,/ng/)),
			t = Engine.process(rule, input);
		expect(t['0']).toBeDefined();
		expect(t['0'].count).toEqual(5);
		expect(t['0']['0'].match).toEqual('t');
		expect(t['0']['1'].match).toEqual('e');
		expect(t['0']['2'].match).toEqual('st');
		expect(t['0']['3'].match).toEqual('i');
		expect(t['0']['4'].match).toEqual('ng');
	});

	it("should return nothing when sequence is not completely matched", function(){
		var rule = grammar.rule('sequenceFail', grammar.sequence(/t/,/e/,/s/,/i/,/ng/)),
			t = Engine.process(rule, input);
		expect(t).toBeUndefined();
		// we also expect input to be untouched (unconsumed)
		expect(input.head).toEqual(0);
		expect(input.last).toEqual(0);
	});
});
