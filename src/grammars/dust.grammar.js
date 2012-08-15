var dust = new Peggy('dust');

dust.root("body", 
	dust.choice(":comment", ":buffer"
	/*, ":section", ":partial", ":special", ":reference", ":buffer"*/), 
	function(value){
		return "Comment: " + value.comment + "<br />Buffer: " + value.buffer;
	}
);

dust.rule("literal", 
	dust.sequence(dust.not(":tag"), dust.not(":eol"), dust.choice(":esc", /[^"]/)),
	function(value){
		console.log('literal', value);
	}
);

dust.rule("comment", 
	dust.sequence(":ld", "!", dust.repeat(dust.choice(':eol', /.+[^!}]/)), "!", ":rd"),  
	function(value){ 
		return value["2"];
	}
);

dust.rule("buffer", 
	dust.choice(':eol', ':ws', dust.sequence(dust.not(':tag'), dust.not(':eol'), dust.not(':comment'), /./)),
	function(value) {
		console.log('buffer', value);
	}
);

dust.rule("tag", 
	dust.sequence(":ld", /[#?\^><+%:@\/~%]/, dust.not(":rd"), ":rd")
);

dust.rule("esc", '\\"', function(value) { console.log('esc', value); /*return '"';*/ });
dust.rule("ld", "{");
dust.rule("rd", "}");
dust.rule("eol", dust.choice("\n", "\r\n", "\r", "\u2028", "\u2029"));
dust.rule("ws", /[\t\v\f\u00A0\uFEFF]/);



if(typeof(exports) !== "undefined" && exports !== null) { exports = dust; }
