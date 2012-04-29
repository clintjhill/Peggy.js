var Scanner = require('../src/peggy.js').Peggy.StringScanner;

describe("StringScanner", function(){
	it("should perform stateless tests", function(){
		var scanner = new Scanner("helloworld");
		scanner.scan(/hello/);
		var head = scanner.head, last = scanner.last;
		expect(scanner.test(/world/)).toBeTruthy();
		expect(scanner.head).toEqual(head);
		expect(scanner.last).toEqual(last);
	});
});
