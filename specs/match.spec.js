var Match = require('../src/peggy.js').Peggy.Match,
	testTree = {
		originalString: 'test',
		count: 1,
		'0': {
			string: 'test',
			rule: { name: 'testRule', isTerminal: false },
			count: 4,
			'0': {
				string: 't',
				rule: { isTerminal: true }
			},
			'1': {
				string: 'e',
				rule: { isTerminal: true }
			},
			'2': {
				string: 's',
				rule: { isTerminal: true }
			},
			'3': {
				string: 't',
				rule: { isTerminal: true }
			}
		}
	};
	
describe("Match instantiation", function(){
	
	it("should throw on undefined tree", function(){
		expect(function() {
			var m = new Match(); 
		}).toThrow('Tree must be defined for Match');
	});
	
	it("should throw when tree has no count", function(){
		expect(function() { 
			var m = new Match({originalString:'Throw test', count: 0});
		}).toThrow('Failed to parse "Throw test"');
	});
	
});

describe("Match safeCollect", function(){
	var mSC = new Match({originalString: 'test', count: 1}),
		collection = {};
	
	it("should add to collection when key is missing", function(){
		expect(collection['emptyTest']).toBeUndefined();
		mSC.safeCollect(collection, 'emptyTest', 1);
		expect(collection['emptyTest']).toEqual(1);
	});
	
});

describe("Match tree processing", function(){
	var result = new Match(testTree),
		capture = result.result();

	it("should capture all rule nodes", function(){
		expect(capture).toBeDefined();
		expect(capture.testRule).toBeDefined();
		expect(capture.testRule).toEqual({match: "test", value: {"0":"t","1":"e","2":"s","3":"t"}});
	});
});

