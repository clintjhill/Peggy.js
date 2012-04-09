var JSHINT = require("./lib/jshint").JSHINT,
	util = require("util"),
	src = require("fs").readFileSync(process.argv[2], "utf8");

JSHINT(src, { evil: true, forin: true, maxerr: 100, debug: true });

var e = JSHINT.errors, found = 0, w;

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
	util.print( "JSHint check passed.\n" );
}
