var Scanner = Peggy.StringScanner,
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
		expect(t['0'].match).toEqual('testing');
	});

	it("should recognize aliases", function(){
		var xyz = grammar.rule('xyz', /xyz/), rule = grammar.rule('aliasNotter', grammar.sequence(/test/, grammar.not(':xyz'), /ing/)),
		t = Engine.process(rule, input);
		expect(t).toBeDefined();
		// there should be 3 matches
		expect(t['0'].count).toEqual(3);
		// but the string should only be for the non-noter.
		expect(t['0'].match).toEqual('testing');
		expect(t['0']['0'].match).toEqual('test');
		expect(t['0']['1'].elided).toBeTruthy();
		expect(t['0']['2'].match).toEqual('ing');
	});
});
