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
	equal(test.eventId, 1, "Should have 1 event.");
});

test("Extending matched values", function(){
	var test = new Peggy(
		{"a": /\w/},
		{"a": function(w){ return w + "-test"; }}
	);
	test.parse("x");
	equal(test.tree.a, "x-test", "Extension should have applied.");
	throws(function(){ test.parse("---"); }, "Should throw on bad parse.");
});

test("Extending nested rules matched values", function(){
	var test = new Peggy(
		{"a": [/\w/, ["+", /\d/]]},
		{"a": function(w, d){
			return {w: w, d: d}
		}}
	);
	test.parse("w123");
	equal(test.tree.a.w, "w", "Should equal w.");
	equal(test.tree.a.d.length, 3, "Should have 3 digits.");
	throws(function(){ test.parse("w"); }, "Should throw on bad parse.");
});

test("Sequence", function(){
	var test = new Peggy({"a": [/\w/, /\s/, /\w/]});
	throws(function(){ test.parse(" w "); }, "Should throw on bad parse.");
	test.parse("w w");
	ok(test.tree, "Should have tree after successful parse.");
	equal(test.eventId, 3, "Should have 3 events.");
});

test("Zero or More", function(){
	// Zero or More like this would never throw - never fail a parse.
	var test = new Peggy({"a": ["*", /\w/]});
	test.parse(" ");
	ok(test.tree, "Should have tree after a successful parse.");
	equal(test.eventId, 0, "Should have no event (no match made).");
	test.parse("w");
	ok(test.tree, "Should have tree after a successful parse.");
	equal(test.eventId, 1, "Should have 1 event.");
	// TODO: This is a bit confusing because it doesn't have the doubling on
	// the /\w/ the way the nested rules do. (See below)
	deepEqual(test.tree.a[/\w/], {eventId: 1, value: "w"}, "Should have 1 match.");
});

test("One or More", function(){
	var test = new Peggy({"a": ["+", "pees"], "pees": /p/});
	throws(function(){ test.parse("nope"); }, "Should throw on bad parse.");
	test.parse("parse");
	ok(test.tree, "should have a tree after successful parse.");
	test.parse("pplease");
	ok(test.tree, "Should have a tree after successful parse.");
	equal(test.tree.a.pees.length, 2, "Should have 2 pees.");
	equal(test.tree.a.pees[0].eventId, 1, "First index should have eventId of 1.");
});

test("Nested One or More rule in a Sequence", function(){
	var test = new Peggy( {"a": [/\w/, ["+", /\d/]]} );
	test.parse("w1");
	ok(test.tree, "Should have a tree after successful parse.");
	equal(test.eventId, 2, "Should have 2 match events.");
	ok(test.tree.a[/\w/], "Should have first in sequence.");
	deepEqual(test.tree.a[/\w/], {eventId: 1, value: "w"}, "Should equal w.");
	ok(test.tree.a[/\d/], "Should have second in sequence.");
	// TODO: This is a bit confusing because the first d is for the non-terminal
	// and the second d is for the actual terminal.
	deepEqual(test.tree.a[/\d/][/\d/], {eventId: 2, value: "1"}, "Should have 1 match.");
	test.parse("w123");
	equal(test.eventId, 2, "Should have 2 match events.");
	equal(test.tree.a[/\d/][/\d/].length, 3, "Should have 3 matches.");
});
