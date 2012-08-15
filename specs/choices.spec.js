var Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("Choice rules", function(){

	var input = new Scanner("testing"), grammar = new Peggy('testGrammar');
	
	beforeEach(function(){
		input.reset();
	});

	it("should return on first match", function(){
		var rule = grammar.rule('choice', grammar.choice(/st/,/t/,/e/)),
			t = Engine.process(rule, input);
		expect(t['0']).toBeDefined();
		expect(t['0'].count).toEqual(1);
		expect(t['0']['0'].match).toEqual('t');
	});

	it("should leave input unconsumed on failure", function(){
		var rule = grammar.rule('choiceFail', grammar.choice(/x/,/y/)),
			t = Engine.process(rule, input);
		expect(t).toBeUndefined();
		expect(input.head).toEqual(0);
		expect(input.last).toEqual(0);
	});
});
