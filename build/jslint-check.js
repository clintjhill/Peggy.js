var JSLINT = require("./lib/jslint").JSLINT,
	print = require("sys").print,
	src = require("fs").readFileSync("dist/peggy.js", "utf8");

JSLINT(src, { evil: true, forin: true, maxerr: 100 });

var e = JSLINT.errors, found = 0, w;

for ( var i = 0; i < e.length; i++ ) {
	w = e[i];

	found++;
	print( "\n" + w.evidence + "\n" );
	print( "    Problem at line " + w.line + " character " + w.character + ": " + w.reason );
}

if ( found > 0 ) {
	print( "\n" + found + " Error(s) found.\n" );

} else {
	print( "JSLint check passed.\n" );
}
