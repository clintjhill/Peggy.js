(function() {
	var StringScanner;
	((typeof exports !== "undefined" && exports !== null) ? exports : this).StringScanner = (function() {
		
		StringScanner = function(source) {
			this.source = source.toString();
			this.reset();
			return this;
		};
		
		StringScanner.prototype.scan = function(regexp) {
			var matches = regexp.exec(this.getRemainder());
			return (matches && matches.index === 0) ? this.setState(matches, {
				head: this.head + matches[0].length,
				last: this.head
			}) : this.setState([]);
		};
		
		StringScanner.prototype.getRemainder = function() {
			return this.source.slice(this.head);
		};
		
		StringScanner.prototype.setState = function(matches, values) {
			var _a, _b;
			this.head = (typeof(_a = ((typeof values === "undefined" || values === null) ? undefined: values.head)) !== "undefined" && _a !== null) ? _a: this.head;
			this.last = (typeof(_b = ((typeof values === "undefined" || values === null) ? undefined: values.last)) !== "undefined" && _b !== null) ? _b: this.last;
			this.captures = matches.slice(1);
			return (this.match = matches[0]);
		};
		
		StringScanner.prototype.getSource = function() {
			return this.source;
		};

		StringScanner.prototype.reset = function() {
		  return this.setState([], {
			head: 0,
			last: 0
		  });
		};

		return StringScanner;
	})();
	
})();

