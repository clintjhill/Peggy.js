/*
	Prototype for Peggy instances that includes the API to build a Grammar.
*/
Peggy.prototype = {

	/*
		Builds a rule and declares it as root by setting it
		against the rules collection in the 'root' property.
		Root is where all the parsing of the grammar will begin.
	*/
	root: function(name, declaration, extension, instrument) {
		var root = this.rule(name, declaration, extension, instrument);
		this.rules.root = root;
	},

	/*
		Builds a rule, adds it to the collection and returns it.
	*/
	rule: function(name, declaration, extension, instrument) {
		var rule = Peggy.buildRule(this, declaration || name, extension);
		rule.name = name;
		// This flag will add console statements at runtime if the
		// grammar declares these booleans. Use at your own advantage and risk.
		rule.instrument = instrument;
		this.rules[this.rules.count] = rule;
		this.rules.count += 1;
		return rule;
	},

	sequence: function(/* declaration */) {
		var rule = this.nonTerminal(arguments);
		rule.type = 'sequence';
		return rule;
	},

	choice: function(/* declaration */) {
		var rule = this.nonTerminal(arguments);
		rule.type = 'choice';
		return rule;
	},

	repeat: function(declaration, mn, mx) {
		var rule, min = mn || 1, max = mx || 1.0/0;
		rule = Peggy.buildRule(this, declaration, null, Peggy.Executions.repeat);
		rule.type = 'repeat';
		// TODO: This is pretty wonky. It's in and & not rules also
		rule.declaration = Peggy.buildRule(this, declaration);
		rule.min = min;
		rule.max = max;
		return rule;
	},

	and: function(declaration) {
		var rule = Peggy.buildRule(this, declaration, null, Peggy.Executions.and);
		rule.type = 'and';
		rule.declaration = Peggy.buildRule(this, declaration);
		return rule;
	},

	not: function(declaration) {
		var rule = Peggy.buildRule(this, declaration, null, Peggy.Executions.not);
		rule.type = 'not';
		rule.declaration = Peggy.buildRule(this, declaration);
		return rule;
	},

	/*
		Returns an array that is considered a NonTerminal.
		It is a collection of rules each built by the #buildRule function.
	*/
	nonTerminal: function(declarations) {
		var rules = [];
		for (var i = 0; i < declarations.length; i++) {
			rules.push(Peggy.buildRule(this, declarations[i]));
		}
		return rules;
	},

	/*
		Main parsing function. If there are rules set for the Grammar
		then it will create a new input instance and create a Peggy.Match
		against it. Finally it will set result against the root of the Grammar
		and execute an extension if one is provided.
	*/
	parse: function(string) {
		if (this.rules.count > 0) {
			var 
				// scanner for the string to parse
				input = new Peggy.StringScanner(string),
				// root rule within this Grammar
				root = this.rules.root || this.rules[0],
				// tree processing result from engine
				tree,
				// match built from tree result
				match,
				// final result from match
				result;

			if(root.instrument) console.log('Begin ' + this.name + '#parse');
			tree = Peggy.Engine.process(root, input);
			if(root.instrument) console.log('End ' + this.name + '#parse', tree, root);

			if (tree.count === 0) throw 'Failed to parse "' + tree.originalString + '"';

			if(root.instrument) console.log('Begin ' + this.name + '#match', tree, root);
			match = new Peggy.Match(tree, root.instrument);
			result = match.result(root);
			if(root.instrument) console.log('End ' + this.name + '#match', result, root);

			return result[root.name];
		}
	}
};