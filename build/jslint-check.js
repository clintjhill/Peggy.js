var JSLINT = require("./lib/jslint").JSLINT,
	util = require("util"),
	src = require("fs").readFileSync("dist/peggy.js", "utf8");

JSLINT(src, { evil: true, forin: true, maxerr: 100 });

var e = JSLINT.errors, found = 0, w;

for ( var i = 0; i < e.length; i++ ) {
	w = e[i];

	found++;
	if(w){
		util.print( "\n" + w.evidence + "\n" );
		util.print( "    Problem at line " + w.line + " character " + w.character + ": " + w.reason );		
	}
}

if ( found > 0 ) {
	util.print( "\n" + found + " Error(s) found.\n" );

} else {
	util.print( "JSLint check passed.\n" );
}
