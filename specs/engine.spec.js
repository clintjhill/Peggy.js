var Engine = require('../src/peggy.js').Peggy.Engine,
	Peggy = require('../src/peggy.js').Peggy,
	Scanner = require('../libs/strscan.js').StringScanner;

describe("Engine rule resolving", function(){
	var test = new Peggy('resulv'),
		r = test.rule('resolved', /w+/),
		a = test.rule('alias', ':resolved'),
		negTest = new Peggy('unresulv'),
		ur = negTest.rule('resolved', /w+/),
		b = negTest.rule('alias', ':resolved');
		
	it("should find aliases only within rule's grammar", function(){
		expect(Engine.resolve(a)).toEqual(r);
		expect(Engine.resolve(b)).toNotEqual(r);
	});

});

describe("Engine tree defaulting", function(){
	var fakeTree = {},
		fakeInput = { getSource: function(){ return 'mocked'; }};

	it("should wrap the input source into a new tree if no tree is provided", function(){
		expect(Engine.defaultTree(fakeInput)).toEqual({count: 0, originalString: 'mocked'});
	});
	
	it("should return the tree if one is provided", function(){
		expect(Engine.defaultTree(fakeInput, fakeTree)).toEqual(fakeTree);
	});
	
});

describe("Engine RegExp handling", function(){
	//TODO: Not sure if this is the best way to test for regexp
	it("should handle reserved RegExp characters", function(){
		expect(Engine.safeRegExp('+').toString()).toEqual("/\\+/");
	});

	it("should handle RegExp as strings", function(){
		expect(Engine.safeRegExp("/(\\w+)/").toString()).toEqual("/(\\w+)/");
	});
});

describe("Engine Terminal rules", function(){
	var input = new Scanner("testing"),
		tree = { count: 0, originalString: 'originalTest' },
		rule = { type: 'terminal', declaration: /t/ };

	it("should only add to tree if a match", function(){
		var not = { type: 'stringTerminal', declaration: '+' };
		Engine.terminal(not, input, tree);
		expect(tree.count).toEqual(0);
		expect(tree['0']).toBeUndefined();
	});

	it("should increment tree count on match", function(){
		input.reset();
		var t = Engine.terminal(rule, input, tree);
		expect(t.count).toEqual(1);
	});

	it("should add a node to the tree on a match", function(){
		input.reset();
		var t = Engine.terminal(rule, input, tree);
		expect(t['0']).toBeDefined();
		expect(t['0'].rule).toEqual(rule);
		expect(t['0'].string).toEqual('t');
	});
});

describe("Engine Non-Terminal rules", function(){

});
