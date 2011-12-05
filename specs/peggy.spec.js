var Peggy = require('../src/peggy.js').Peggy;

describe("Peggy instantiation", function(){
	it("should throw on bad grammar name", function(){
		expect(function(){
			var p = new Peggy();
		}).toThrow("A grammar name is required");
	});
	
	it("should initialize rules", function(){
		var p = new Peggy("test rules");
		expect(p.rules.count).toEqual(0);
	})
});