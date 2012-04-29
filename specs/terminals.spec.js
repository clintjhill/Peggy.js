var Peggy = require('../src/peggy.js').Peggy,
	Scanner = Peggy.StringScanner,
	Engine = Peggy.Engine;

describe("Terminal rules", function(){
	var input = new Scanner("testing"),
		grammar = new Peggy('testGrammer');

	beforeEach(function(){
		input.reset();
	});

	it("should only add to tree if a match", function(){
		var not = grammar.rule('plus', '+'),
			t = Engine.process(not, input);
		expect(t.count).toEqual(0);
		expect(t['0']).toBeUndefined();
	});

	it("should increment tree count on match", function(){
		var rule = grammar.rule('t', /t/), 
			t = Engine.process(rule, input);
		expect(t.count).toEqual(1);
	});

	it("should add a node to the tree on a match", function(){
		var rule = grammar.resolve('t'), 
			t = Engine.process(rule, input);
		expect(t['0']).toBeDefined();
		expect(t['0'].rule).toEqual(rule);
		expect(t['0'].string).toEqual('t');
	});
});
