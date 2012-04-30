var dust = new Peggy('dust');

dust.root("body", dust.choice(":comment"/*, ":section", ":partial", ":special", ":reference", ":buffer"*/), function(value){
	return value;
});

dust.rule("literal", dust.sequence(dust.not(":tag"), dust.not(":eol"), dust.choice(":esc", /[^"]/)))
dust.rule("esc", '\\"', function(value) { return '"'; });
dust.rule("comment",  dust.sequence(":ld", "!", /.+[^!}]/, "!", ":rd"),  function(value){ return value[2]; });
dust.rule("tag", dust.sequence(":ld", /[#?^><+%:@/~%]/, dust.not(":rd"), ":rd"));

dust.rule("ld", "{");
dust.rule("rd", "}");
dust.rule("eol", dust.choice("\n", "\r\n", "\r", "\u2028", "\u2029"));
dust.rule("ws", /[\t\v\f\u00A0\uFEFF]/);

if(typeof(exports) !== "undefined" && exports !== null) {
	exports = dust;
}
