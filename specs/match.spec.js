var Match = Peggy.Match,
	grammar = { instrument: false },
	testTree = {
		original: 'test',
		count: 1,
		'0': {
			match: 'test',
			rule: { name: 'testRule', isTerminal: false, grammar: grammar},
			count: 4,
			'0': {
				match: 't',
				rule: { isTerminal: true, grammar: grammar }
			},
			'1': {
				match: 'e',
				rule: { isTerminal: true, grammar: grammar }
			},
			'2': {
				match: 's',
				rule: { isTerminal: true, grammar: grammar }
			},
			'3': {
				match: 't',
				rule: { isTerminal: true, grammar: grammar }
			}
		}
	};
	
describe("Match instantiation", function(){
	
	it("should throw on undefined tree", function(){
		expect(function() {
			var m = new Match(); 
		}).toThrow('Tree must be defined for Match to capture against.');
	});
	
});

describe("Match tree processing", function(){
	var result = new Match(testTree),
		capture = result.result();

	it("should capture all rule nodes", function(){
		expect(capture).toBeDefined();
		expect(capture.testRule).toBeDefined();
		expect(capture.testRule).toEqual({"0":"t","1":"e","2":"s","3":"t"});
	});
});

