var Match = require('../src/match.js').Match,
	mockTree = {
		originalString: 'mockTree',
		count: 1
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
	var mSC = new Match(mockTree),
		collection = {};
	
	it("should add to collection when key is missing", function(){
		expect(collection['emptyTest']).toBeUndefined();
		mSC.safeCollect(collection, 'emptyTest', 1);
		expect(collection['emptyTest']).toEqual(1);
	});
	
});

