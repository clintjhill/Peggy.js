var css = new Peggy(
	{
		"sheet": ["rules"],
		"rules": ["+", "rule"],
		//"medias": ["*", "media"],
		//"imports": ["*", "import"],
		"rule": [ "ruleName", "openBracket", "ruleBody", "closeBracket" ],
		"ruleName": [/\w+/, ["*", "whitespace"]],
		"openBracket": [/\{/, ["*", "whitespace"]],
		"ruleBody": ["*", "property"],
		"closeBracket": [/\}/, ["*", "whitespace"]],
		"property": [ "propertyName", "propertyValue" ],
		"propertyName": [/\w+/, ["*", "whitespace"], /:/, ["*", "whitespace"]],
		"propertyValue": [/\w+/, ["*", "whitespace"], /;/, ["*", "whitespace"]],
		"whitespace": /\s+/
	},
	{
		"sheet": function(rules){
			console.log('sheet', rules, this);
		},
		"rules": function(rule){
			console.log('rules', rule);
		},
		"rule": function(name, open, body, close){
			console.log('rule', name, open, body, close, this);
		},
		"ruleName": function(name, ws){
			console.log('ruleName', name, ws, this);
			return name;
		},
		"ruleBody": function(property){
			console.log('ruleBody', property);
		},
		"openBracket": function(open, ws){
			console.log('openBracket', open, ws);
		},
		"closeBracket": function(close, ws){
			console.log('closeBracket', close, ws);
		},
		"property": function(name, value){
			var prop = {};
			prop[name] = value;
			console.log('property', name, value);
			return prop;
		},
		"propertyName": function(name, ws1, colon, ws2){
			console.log('propertyName', name, ws1, colon, ws2);
			return name;
		},
		"propertyValue": function(value, ws1, semicolon, ws2){
			console.log('propertyValue', value, ws1, semicolon, ws2);
			return value;
		},
		"whitespace": function(ws){
			console.log('whitespace', ws);
		}
	}
);

module("CSS testing");

test("Simple rule", function(){
	css.parse("body { color: black; }");
	console.log('body { color: black; }', css.tree);
	ok(css.tree, "Should return something");
});

test("Simple rule no spaces", function(){
	css.parse("body{color:red;}");
	console.log("body{color:red}", css.tree);
	ok(css.tree, "Should return something");
});

test("Simple rule lots of spaces", function(){
	css.parse("body     {        color:      blue;      }  ");
	console.log("body     {        color:      blue;      }  ", css.tree);
	ok(css.tree, "Should return something");
});

test("2 properties", function(){
	css.parse("body { color: yellow; color: blue; }");
	console.log("body { color: yellow; color: blue; }", css.tree);
	ok(css.tree, "Should return something");
});

test("2 rules", function(){
	css.parse("body { color: blue; } div { color: red; }");
	console.log("body { color: blue; } div { color: red; }", css.tree);
	ok(css.tree, "Should return something");
});
