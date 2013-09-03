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
  test.parse("word");
  ok(test.tree, "Should have tree after successful parse.");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.a, "w", "Should have parsed 1 character (\\w).");
});

test("Parse returns Object or false value", function(){
  var test = new Peggy({ "a": /\w/ });

  // positive case
  var result = test.parse("B");
  ok(result, "Should have a result.");
  ok(_.isObject(result), "Should be an Object.");
  deepEqual(result, test.tree, "Should have a result equal to the tree.");

  // negative case
  result = test.parse("-");
  ok(!result, "Should have a result.");
  ok(_.isBoolean(result), "Should be a Boolean.");
});

module("Peggy Execution Types");

test("terminal", function(){
  // test regular-expression type terminal
  var test = new Peggy({"a": /\w/});

  // positive case
  test.parse("A");
  ok(test.tree, "Should have tree after successful parse.");
  ok(!_.isArray(test.tree.a), "Should have a non-Array value.");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.a, "A", "Should equal A.");
  
  // negative case
  test.parse("-");
  ok(!test.tree, "Should not have a tree after failed parse.");

  // test non-regular-expression type terminal
  test = new Peggy({"b": "B"});

  // positive case
  test.parse("B");
  ok(test.tree, "Should have tree after successful parse.");
  ok(!_.isArray(test.tree.b), "Should have a non-Array value.");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.b, "B", "Should equal B.");

  // negative case
  test.parse("1");
  ok(!test.tree, "Should not have a tree after failed parse.");
});

test("sequence", function(){
  var test = new Peggy({
    "a": ["word", "space", "number"],
    "word": /\w*/,
    "space": /\s/,
    "number": /\d/
  });

  // positive case
  test.parse("word 1");
  ok(!_.isArray(test.tree.a), "Should not be an Array value.");
  equal(test.eventId, 3, "Should have 3 events.");
  equal(test.tree.a.word, "word", "Should equal word.");
  equal(test.tree.a.space, " ", "Should equal space.");
  equal(test.tree.a.number, 1, "Should equal 1.");

  // negative case
  test.parse(" word ");
  ok(!test.tree, "Should not have a tree after failed parse.");

  // negative case
  test.parse("word ");
  ok(!test.tree, "Should not have a tree after failed parse.");

  // Special case where rule is duplicated within a sequence.
  // The result should be an array value for that name (index/order maintained).
  test = new Peggy({
    "a": ["word", "space", "word"],
    "word": /\w*/,
    "space": /\s/
  });

  test.parse("peggy good");
  ok(!_.isArray(test.tree.a), "Should not be an Array value.");
  equal(test.eventId, 3, "Should have 3 events.");
  equal(test.tree.a.word[0], "peggy", "Should equal peggy.");
  equal(test.tree.a.space, " ", "Should equal space.");
  equal(test.tree.a.word[1], "good", "Should equal good.");

});

test("zero-or-more", function(){
  var test = new Peggy({
    "a": ["*", "word"],
    "word": /\w/
  });

  // zero-or-more is always positive case
  test.parse(" ");
  equal(test.eventId, 0, "Should have no event (no match made).");

  // zero-or-more is always an array result
  test.parse("w");
  ok(_.isArray(test.tree.a.word), "Should have an array value.");
  equal(test.tree.a.word.length, 1, "Should have 1 result.");

  test.parse("what");
  equal(test.eventId, 4, "Should have 1 event.");
  equal(test.tree.a.word.length, 4, "Should have 4 result.");
  equal(test.tree.a.word[0], "w", "Should have 1 match.");
  equal(test.tree.a.word[1], "h", "Should have 1 match.");
  equal(test.tree.a.word[2], "a", "Should have 1 match.");
  equal(test.tree.a.word[3], "t", "Should have 1 match.");
});

test("one-or-more", function(){
  var test = new Peggy({
    "a": ["+", "word"],
    "word": /\w/
  });

  // positive one case
  test.parse("w");
  ok(!_.isArray(test.tree.a), "Should not have an array value.");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.a.word, "w", "Should equal w.");

  // positive more case
  test.parse("what");
  ok(!_.isArray(test.tree.a), "Should not have an array value.");
  equal(test.eventId, 4, "Should have 4 event.");
  equal(test.tree.a.word.length, 4, "Should have 4 result.");
  equal(test.tree.a.word[0], "w", "Should have 1 match.");
  equal(test.tree.a.word[1], "h", "Should have 1 match.");
  equal(test.tree.a.word[2], "a", "Should have 1 match.");
  equal(test.tree.a.word[3], "t", "Should have 1 match.");

  // negative case
  test.parse("");
  equal(test.eventId, 0, "Should have no event (no match made).");
  ok(!test.tree, "Should not have a tree after failed parse.");
});

test("choice", function(){
  var test = new Peggy({
    "a": ["||", "lowerA", "upperA"],
    "lowerA": "a",
    "upperA": "A"
  });

  // positive cases
  test.parse("a");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.a, "a", "Should match lower.");

  // positive case
  test.parse("A");
  equal(test.eventId, 1, "Should have 1 event.");
  equal(test.tree.a, "A", "Should match upper.");

  // negative case
  test.parse("b");
  ok(!test.tree, "Should not have a tree after failed parse.");
});

test("optional", function(){
  var test = new Peggy({
    "a": ["word", "optionalSemi", "word"],
    "word": /\w+/,
    "optionalSemi": ["?", "semi-colon"],
    "semi-colon": ";"
  });

  test.parse("peggy;peggy");
  equal(test.eventId, 3, "Should have 3 events.");

  test = new Peggy({
    "a": ["word", "optionalSemi", "word"],
    "word": /\w+/,
    "optionalSemi": ["?", "separator"],
    "separator": ["||", "space", "semi-colon"],
    "space": /\s/,
    "semi-colon": ";"
  });

  test.parse("peggy;peggy");
  equal(test.eventId, 3, "Should have 3 events.");

  test.parse("peggy peggy");
  equal(test.eventId, 3, "Should have 3 events.");
});

test("not", function(){
  // simple case
  var test = new Peggy({
    "a": ["!", "digit"], 
    "digit": /\d/
  });
  test.parse("w");
  equal(test.eventId, 1, "Should have 1 event.");
});

module("Peggy Nested Executions");

test("Nested One-or-more", function(){
  var test = new Peggy({
    "a": ["+", "dots"],
    "dots": ["+", "dot"],
    "dot": /\.\s/ 
  });

  // positive case
  var result = test.parse(". . . ");
  equal(test.eventId, 3, "Should have 3 events.");
  // result is now just the AST of the parse
  ok(result, "Should have a result.");
  ok(result.a.dots, "Should have dots matches.");
  ok(result.a.dots[0].dot, "Should have dot matches.");
  ok(_.isArray(result.a.dots[0].dot), "Should have array value for dot.");
  equal(result.a.dots[0].dot[0], ". ", "Should be .");
  equal(result.a.dots[0].dot[1], ". ", "Should be .");
  equal(result.a.dots[0].dot[2], ". ", "Should be .");

  // negative case
  result = test.parse("..");
  ok(!result, "Should not have a result.");
});

test("Nested Sequence in One-or-more", function(){

  // very simple sequence in a one-or-more
  var test = new Peggy({
    "a": ["+", "dots"],
    "dots": ["dot", "space"],
    "dot": /\./,
    "space": /\s/
  });

  var result = test.parse(". . . ");
  equal(test.eventId, 6, "Should have 6 events.");
  ok(_.isArray(result.a.dots), "Should have array value for dots.");
  deepEqual(result.a.dots[0], {"dot": ".", "space": " "}, "Should have a dot/space sequence match.");

  // a more complicated sequence with one-or-mores inside
  test = new Peggy({
    "a": ["+", "combos"],
    "combos": ["dots", "spaces"],
    "dots": ["+", "dot"],
    "spaces": ["+", "space"],
    "dot": /\./,
    "space": /\s/
  });

  // a bit more complicated test
  result = test.parse(".. ..... ... ");
  equal(result.a.combos[0].dots.dot.length, 2, "First dots should be 2.");
  equal(result.a.combos[1].dots.dot.length, 5, "Second dots should be 5.");
  equal(result.a.combos[2].dots.dot.length, 3, "Third dots should be 3.");
});

module("Peggy Extending Matches");

test("Simple extension", function(){
  var test = new Peggy({
    "a": /\w+/
  },{
    "a": function(result){
      return {"found": result};
    }
  });

  test.parse("value");
  equal(test.tree.a.found, "value", "Should have found value.");
});

test("Extensions fire for every execution", function(){

  expect(6);

  var test = new Peggy({
    "a": ["word", "digit", "word", "digit", "word"],
    "word": /[a-z]+/,
    "digit": /\d/
  },{
    "a": function(result, rule){
      ok(result, "Fired 'a' extension'");
      return result;
    },
    "word": function(result, rule){
      ok(result, "Fired 'word' extension'");
      return result;
    },
    "digit": function(result, rule){
      ok(result, "Fired 'digit' extension'");
      return result;
    }
  });

  test.parse("peggy1peggy2peggy");

});
