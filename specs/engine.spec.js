var Engine = Peggy.Engine,
	Scanner = Peggy.StringScanner;

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
/*
describe("Engine RegExp handling", function(){
	//TODO: Not sure if this is the best way to test for regexp
	it("should handle reserved RegExp characters", function(){
		expect(Engine.safeRegExp('+').toString()).toEqual("/\\+/");
	});

	it("should handle RegExp as strings", function(){
		expect(Engine.safeRegExp("/(\\w+)/").toString()).toEqual("/(\\w+)/");
	});
});*/


