var css = new Peggy(
	{
		"sheet": ["rules"],
		"rules": ["+", "rule"],
		//"medias": ["*", "media"],
		//"imports": ["*", "import"],
		"rule": [
			"ruleName",
			"openBracket",
			"ruleBody",
			"closeBracket"
		],
		"ruleName": [/\w+/, ["*", "whitespace"]],
		"openBracket": [/\{/, ["*", "whitespace"]],
		"ruleBody": ["*", "property"],
		"closeBracket": [/\}/, ["*", "whitespace"]],
		"property": [
			"propertyName",
			"propertyValue"
		],
		"propertyName": [/\w+/, ["*", "whitespace"], /:/, ["*", "whitespace"]],
		"propertyValue": [/\w+/, ["*", "whitespace"], /;/, ["*", "whitespace"]],
		"whitespace": /\s+/
	},
	{
		"sheet": function(rules, medias, imports){
			console.log('sheet', rules, medias, imports);
		},
		"rules": function(rule){

		},
		"rule": function(ruleName, openBracket, ruleBody, closeBracket){

		},
		"ruleName": function(name, nested){
			console.log('ruleName', name, nested);
		},
		"property": function(propertyName, propertyValue){

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
