module("Peggy Core");

test("Builds rules in constructor", function(){
	var test = new Peggy({ root: /\w/ });
	ok(test.rules, "Rules should exist");
	equal(test.rules.length, 1, "Should be 1 rule");
	equal(test.root().name, "root", "Root should be root");
});

test("Rule resolving", function(){
	var test = new Peggy({ "a": /\w/, "b": /\s/ });
	ok(test.resolve("a"), "should find 'a' rule");
	equal(test.resolve("a").name, "a", "should find rule with 'a' name");
	notEqual(test.resolve("a").name, "b", "should not match 'b' name");
	equal(test.resolve("a").decl.toString(), /\w/, "declaration should equal regexp /\w/");
	notEqual(test.resolve("a").decl.toString(), /\s/, "declaration should not equal regexp /\s/");
});

test("Tree building", function(){
	var test = new Peggy({ "a": /\w/ });
	ok(test.parse("test"), "Should return on successful parse.");
	throws(function(){ test.parse(" ") }, "Should throw on bad parse.");
	test.parse("word");
	ok(test.tree, "Should have tree after successful parse.");
});
