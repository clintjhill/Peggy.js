(function(){
	var Match;
	((typeof exports !== "undefined" && exports !== null) ? exports : this).Match = (function() {
		Match = function(tree){
			if(typeof tree === 'undefined') throw 'Tree must be defined for Match';
			if(tree.count === 0) throw 'Failed to parse "' + tree.originalString + '"';
			this.tree = tree;
			return this;
		};

		Match.prototype.capture = function(tree){
			if(!tree.count){
				this.processMatch(tree);
			} else {
				for(var m = 0; m < tree.count; m++){
					this.capture(tree[m]);
				}
				this.processMatch(tree);
			}
		};

		Match.prototype.processMatch = function(match){
			this.captures = this.captures || {};
			var rule = match.rule;
			if(rule && rule.name){
				var c = { match: match.string, value: this.getValues(match) };
				this.safeCollect(this.captures, rule.name, c);
			}
		};

		Match.prototype.getValues = function(match){
			if(!match.count && match.rule.extension){
				return match.rule.extension(match.string);
			} else {
				var value = {};
				for(var i = 0; i < match.count; i++){
					var rule = match[i].rule;
					var extended = (rule.extension) ? 
						rule.extension((rule.isTerminal) ?  match[i].string : this.getValues(match[i])) : 
						match[i].string;
					if(rule.isTerminal){
						value[i] = extended;
					} else {
						this.safeCollect(value, rule.name || i, extended);	
					}
				}
				return value;
			}
		};

		Match.prototype.safeCollect = function(collector, key, value){
			if(collector[key]){
				if(Peggy.types[toString.call(collector[key])] !== 'array'){
					collector[key] = [collector[key]];
					collector[key].push(value);
				}
			} else {
				collector[key] = value;
			}
		};

		Match.prototype.result = function(){
			this.capture(this.tree);
			return this.captures;
		};

		return Match;
	})();

})();