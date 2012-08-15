/*
	StringScanner object. Politely stolen from http://sstephenson.github.com/strscan-js/.
	Features removed for size shrinking considerations, but features added for grammar
	purposes. 
*/
Peggy.StringScanner = function(source) {
	this.source = source.toString();
	this.reset();
	return this;
};

Peggy.StringScanner.prototype = {

	scan: function(regexp) {
		var matches = regexp.exec(this.getRemainder());
		return (matches && matches.index === 0) ? this.setState(matches, { head: this.head + matches[0].length, last: this.head }) : this.setState([]);
	},
	
	test: function(regexp) {
		var matches = regexp.exec(this.getRemainder());
		return (matches && matches.index === 0);
	},

	getRemainder:  function() {
		return this.source.slice(this.head);
	},

	setState:  function(matches, values) {
		var _a, _b;
		this.head = (typeof(_a = ((typeof values === "undefined" || values === null) ? undefined : values.head)) !== "undefined" && _a !== null) ? _a: this.head;
		this.last = (typeof(_b = ((typeof values === "undefined" || values === null) ? undefined: values.last)) !== "undefined" && _b !== null) ? _b: this.last;
		this.captures = matches.slice(1);
		return (this.match = matches[0]);
	},
	
	getSource:  function() {
		return this.source;
	},

	hasMore: function(){
		return (this.source.length - this.head) > 0;
	},

	reset:  function(head, last) {
		return this.setState([], { head: head || 0, last: last || 0 });
	}
};