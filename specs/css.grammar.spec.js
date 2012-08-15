describe("CSS Peggy Grammar - Initialization", function(){
	
	it("should have root rule that has repeat", function(){
		expect(css.rules.root.type).toEqual("repeat");
	});

	it("should have root named sheet", function(){
		expect(css.rules.root.name).toEqual("sheet");
	});

});

describe("CSS Peggy Grammar - Parsing", function(){
	
	it("should parse single rule with single property with unhyphenated name and single value", function(){
		var val = css.parse("body{ color: black; } ");
		expect(val).not.toBeUndefined();
		expect(val.rule).not.toBeUndefined();
		expect(val.rule.name).toEqual("body");
		expect(val.rule.body).not.toBeUndefined();
		expect(val.rule.body.property).not.toBeUndefined();
		expect(val.rule.body.property.name).toEqual("color");
		expect(val.rule.body.property.value).toEqual("black");
	});

	it("should parse multiple rules each with single property with unhyphenated names and single values", function(){
		var val = css.parse("body{ color: blue; } div{ color: red; } ");
		expect(val).not.toBeUndefined();
		expect(val.length).toEqual(2);
		var body = val[0].rule;
		var div = val[1].rule;
		expect(body.body.property.name).toEqual("color");
		expect(body.body.property.value).toEqual("blue");
		expect(div.body.property.name).toEqual('color');
		expect(div.body.property.value).toEqual('red');
	});

});