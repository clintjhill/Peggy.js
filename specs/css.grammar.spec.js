describe("CSS Peggy Grammar - Initialization", function(){
	
	it("should have root rule that has repeat", function(){
		expect(css.rules.root.type).toEqual("any");
	});

	it("should have root named sheet", function(){
		expect(css.rules.root.name).toEqual("sheet");
	});

});

describe("CSS Peggy Grammar - Parsing", function(){
	
	it("should parse single rule with single property with unhyphenated name and single value and no whitespace", function(){
		var val = css.parse("body{color:black;}");
		console.log('Parse =>', val);
		expect(val).not.toBeUndefined();
		expect(val.rules[0].rule).not.toBeUndefined();
		expect(val.rules[0].rule.selector).toEqual("body");
		expect(val.rules[0].rule.properties[0]).not.toBeUndefined();
		expect(val.rules[0].rule.properties[0]["color"]).toEqual("black");
	});

	it("should parse single rule with single property with unhyphenated name and single value and whitespace", function(){
		var val = css.parse("body { color: black; }");
		console.log('Parse =>', val);
		expect(val).not.toBeUndefined();
		expect(val.rules[0].rule).not.toBeUndefined();
		expect(val.rules[0].rule.selector).toEqual("body");
		expect(val.rules[0].rule.properties[0]).not.toBeUndefined();
		expect(val.rules[0].rule.properties[0]["color"]).toEqual("black");
	});

	it("should parse multiple rules each with single property with unhyphenated names and single values", function(){
		var val = css.parse("body{ color: blue; } div{ color: red; } ");
		expect(val).not.toBeUndefined();
		expect(val.rules.length).toEqual(2);
		var body = val.rules[0].rule;
		var div = val.rules[1].rule;
		expect(body.selector).toEqual("body");
		expect(div.selector).toEqual("div");
		expect(body.properties[0]["color"]).toEqual("blue");
		expect(div.properties[0]["color"]).toEqual('red');
	});

	it("should parse single media At-rule with single rule with single property with unhyphenated name and single value", function(){
		var val = css.parse("@media screen { p{ color: green; } } ");
		expect(val).not.toBeUndefined();
		expect(val.media).not.toBeUndefined();
		expect(val.media[0].media).not.toBeUndefined();
		expect(val.media[0].media.types).toEqual("screen");
		expect(val.media[0].media.rules[0].rule.selector).toEqual("p");
		expect(val.media[0].media.rules[0].rule.properties[0].color).toEqual("green");
	});

});