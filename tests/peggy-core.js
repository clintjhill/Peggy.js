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
	equal(test.tree.a.value, "w", "Should have parsed 1 character (\\w).");
	equal(test.tree.a.eventId, 1, "Should be event 1.");
});

test("Parse returns Tree", function(){
	var test = new Peggy({ "a": /\w/ });
	var result = test.parse("B");
	ok(result, "Should have a result.");
	deepEqual(result, test.tree, "Should have a result equal to the tree.");
});

test("terminal", function(){
	var test = new Peggy({"a": /\w/});
	throws(function(){ test.parse(" "); }, "Should throw on bad parse.");
	test.parse("A");
	ok(test.tree, "Should have tree after successful parse.");
	ok(!_.isArray(test.tree.a.value), "Should have a non-Array value.");
	equal(test.eventId, 1, "Should have 1 event.");
	equal(test.tree.a.value, "A", "Should equal A.");
	equal(test.tree.a.eventId, 1, "Should be the first event.");
});

test("sequence", function(){
	var test = new Peggy({"a": [/\w/, /\s/, /\w/]});
	throws(function(){ test.parse(" w "); }, "Should throw on bad parse.");
	test.parse("w w");
	ok(test.tree, "Should have tree after successful parse.");
	ok(_.isArray(test.tree.a.value), "Should have an Array value.");
	deepEqual(test.eventId, 3, "Should have 3 events.");
	deepEqual(test.tree.a.value[0], "w", "Should equal w.");
	deepEqual(test.tree.a.value[1], " ", "Should equal space.");
	deepEqual(test.tree.a.value[2], "w", "Should equal w.");
});

test("zero-or-more", function(){
	// zero-or-more like this would never throw - never fail a parse.
	var test = new Peggy({"a": ["*", /\w/]});
	test.parse(" ");
	ok(test.tree, "Should have tree after a successful parse.");
	equal(test.eventId, 0, "Should have no event (no match made).");
	ok(_.isArray(test.tree.a.value), "Should have an array value.");
	test.parse("w");
	ok(test.tree, "Should have tree after a successful parse.");
	equal(test.eventId, 1, "Should have 1 event.");
	deepEqual(test.tree.a.value.length, 1, "Should have 1 result.");
	deepEqual(test.tree.a.value[0][/\w/], {eventId: 1, value: "w"}, "Should have 1 match.");
});

test("one-or-more", function(){
	var test = new Peggy({"a": ["+", /\w/]});
	throws(function(){ test.parse(" "); }, "Should throw on bad parse.");
	test.parse("w");
	ok(test.tree, "Should have tree after a successful parse.");
	ok(_.isArray(test.tree.a.value), "Should have an array value.");
	equal(test.eventId, 1, "Should have 1 event.");
	deepEqual(test.tree.a.value.length, 1, "Should have 1 result.");
	deepEqual(test.tree.a.value[0][/\w/], {eventId: 1, value: "w"}, "Should have 1 match.");
});

test("one-or-more with rule symbol", function(){
	var test = new Peggy({"a": ["+", "pees"], "pees": /p/});
	throws(function(){ test.parse("nope"); }, "Should throw on bad parse.");
	test.parse("parse");
	ok(test.tree, "should have a tree after successful parse.");
	test.parse("pplease");
	ok(test.tree, "Should have a tree after successful parse.");
	equal(test.tree.a.value[0].pees.length, 2, "Should have 2 pees.");
	equal(test.tree.a.value[0].pees[0].eventId, 1, "First index should have eventId of 1.");
	equal(test.tree.a.value[0].pees[0].value, "p", "Should match p.");
	equal(test.tree.a.value[0].pees[1].eventId, 2, "Second index should have eventId of 2.");
	equal(test.tree.a.value[0].pees[1].value, "p", "Should match p.");
});

test("Nested one-or-more", function(){
	var test = new Peggy({"a": ["+", ["+", /\./]] });
	var result = test.parse("...");
	ok(result, "Should have a result.");
	equal(result.a.value.length, 1, "Should have 1 match.");
	equal(result.a.value[0][/\./].value.length, 3, "Should have 3 dots.");
});

test("Deeply nested one-or-more", function(){
	var test = new Peggy({"a": ["+", ["+", ["+", /\./]]] },
		{"a": function(dots){
			var a = dots;
			return a;
		}});
	var result = test.parse("...");
	ok(result, "Should have a result.");
	//TODO: BLAH! This is pretty nasty. Edge-case but nasty still.
	equal(result.a['/\\./'].value.length, 3, "Should have 3 matches.");
});

test("sequence nested within one-or-more", function(){
	var test = new Peggy({"a": ["+", [/\w/, /\s/]]});
	var result = test.parse("w b c ");
	ok(result, "Should have a result.");
	ok(_.isArray(result.a.value), "Result should be an Array.");
	//TODO: BLAH! This is pretty nasty too. 
});

test("Nested one-or-more rule in a Sequence", function(){
	var test = new Peggy( {"a": [/\w/, ["+", /\d/]]} );
	test.parse("w1");
	ok(test.tree, "Should have a tree after successful parse.");
	equal(test.eventId, 2, "Should have 2 match events.");
	equal(test.tree.a.value[0], "w", "Should equal w.");
	equal(test.tree.a.value[1].length, 1, "Should have 1 digit.");
	test.parse("w123");
	equal(test.eventId, 4, "Should have 4 match events.");
	ok(_.isArray(test.tree.a.value[1]), "Nested value should be Array.");
	equal(test.tree.a.value[1].length, 3, "Should have 3 matches.");
});

test("Extending matched values", function(){
	var test = new Peggy(
		{"a": /\w/},
		{"a": function(w){ 
			ok(w, "Should return an argument for w.");
			return w + "-test"; 
		}
	});
	test.parse("x");
	equal(test.tree.a, "x-test", "Extension should have applied.");
	throws(function(){ test.parse("---"); }, "Should throw on bad parse.");
});

test("Extending matched values (nested one-or-more +)", function(){
	var test = new Peggy(
		// a sequence with a one-or-more rule
		{"a": [/\w/, ["+", /\d/]]},
		{"a": function(w, d){ 
			equal(arguments.length, 2, "Should return 2 args.");
			ok(w, "Should return an argument for w.");
			ok(d, "Should return an argument for d.");
			ok(_.isArray(d), "Should return an Array for one-or-more.");
			return {w: w, d: d}; 
		}
	});
	throws(function(){ test.parse("w"); }, "Should throw on bad parse.");
	test.parse("w123");
	equal(test.tree.a.w, "w", "Should equal w.");
	equal(test.tree.a.d.length, 3, "Should have 3 digits.");
	equal(test.tree.a.d[0], 1, "First digit should be 1.");
	equal(test.tree.a.d[1], 2, "Second digit should be 2.");
	equal(test.tree.a.d[2], 3, "Third digit should be 3.");
});

test("Extending matched values (nested zero-or-more *)", function(){
	var test = new Peggy(
		// a sequence with a zero-or-more rule
		{"a": [/\w/, ["*", /\d/]]},
		{"a": function(w, d){ 
			equal(arguments.length, 2, "Should return 2 args.");
			ok(w, "Should return an argument for w.");
			// if there are zero results this is an empty Array
			ok(d, "Should return an argument for d.");
			ok(_.isArray(d), "Should return an Array for zero-or-more.");
			return {w: w, d: d}; 
		}
	});
	throws(function(){ test.parse(" "); }, "Should throw on bad parse.");
	var charOnly = test.parse("w");
	ok(charOnly, "Could return just a character parse due to zero-or-more.");
	var alphaNumeric = test.parse("w123");
	ok(alphaNumeric, "Should return alpha-numerice.");
	equal(alphaNumeric.a.w, "w", "Should equal w.");
	equal(alphaNumeric.a.d.length, 3, "Should have 3 digits.");
	equal(alphaNumeric.a.d[0], 1, "First digit should be 1.");
	equal(alphaNumeric.a.d[1], 2, "Second digit should be 2.");
	equal(alphaNumeric.a.d[2], 3, "Third digit should be 3.");
});

test("Not rule", function(){
	var test = new Peggy({"a": ["!", /\d/]});
	throws(function(){ test.parse("3"); }, "Should throw due to digit.");
	test.parse("w");
	deepEqual(test.tree, {}, "Should be an empty result.");
});

test("Complex Not rule", function(){
	var test = new Peggy({});
	ok("do something!");
});