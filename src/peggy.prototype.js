/*
	Prototype for Peggy instances that includes the API to build a Grammar.
*/
Peggy.prototype = {

	/*
		Builds a rule and declares it as root by setting it
		against the rules collection in the 'root' property.
		Root is where all the parsing of the grammar will begin.

		Adds other features like a completion callback (when all things are
		parsed/matched and done) and an instrumentation flag for tracing purposes.
	*/
	root: function(name, declaration, extension, completed, instrument) {
		var root = this.rule(name, declaration, extension);
		this.rules.root = root;
		this.completed = completed;
		this.instrument = instrument;
	},

	/*
		Builds a rule, adds it to the grammars collection and returns it.
	*/
	rule: function(name, declaration, extension) {
		if(!declaration) throw 'A rule declaration must be provided.';
									// grammar, declaration, extension, execute
		var rule = Peggy.buildRule(this, declaration, extension);
		rule.name = name;
		this.rules[this.rules.count] = rule;
		this.rules.count += 1;
		return rule;
	},

	/*
		The following rules are unnamed NonTerminal rules. They are intended to be used
		to construct more complicated rules. They are also not added to the grammar directly 
		instead they are used as declarations of the consuming rule.

		- sequence
		- choice
		- any

		// API
		sequence
		choice
		0 or more
		1 or more
		optional
		and
		not
	*/

	sequence: function(/* declaration */) {
		var rule = Peggy.buildRule(this, this.nonTerminal(arguments), null, Peggy.Executions.sequence);
		rule.type = 'sequence';
		return rule;
	},

	choice: function(/* declaration */) {
		var rule = Peggy.buildRule(this, this.nonTerminal(arguments), null, Peggy.Executions.choice);
		rule.type = 'choice';
		return rule;
	},

	any: function(/* declaration */) {
		var rule = Peggy.buildRule(this, this.nonTerminal(arguments), null, Peggy.Executions.any);
		rule.type = 'any';
		return rule;
	},

	zeroOrMore: function(/*declaration*/) {
		var rule = Peggy.buildRule(this, this.nonTerminal(arguments), null, Peggy.Executions.zeroOrMore);
		rule.type = 'zeroOrMore';
		return rule;
	},

	/*
		The following rules are unnamed rules. They are intended to be used
		to designate an action for a rule. In other words "verb rule". They are also
		not added to the grammar directly instead they are used as declarations
		of the consuming rule.

		- repeat
		- and
		- not
	*/

	repeat: function(name, declaration, mn, mx) {
		var rule, min = mn || 1, max = mx || 1.0/0;
		rule = Peggy.buildRule(this, Peggy.buildRule(this, declaration), null, Peggy.Executions.repeat);
		rule.name = name;
		rule.type = 'repeat';
		rule.min = min;
		rule.max = max;
		return rule;
	},

	and: function(declaration) {
		var rule = Peggy.buildRule(this, Peggy.buildRule(this, declaration), null, Peggy.Executions.and);
		rule.type = 'and';
		return rule;
	},

	not: function(declaration) {
		var rule = Peggy.buildRule(this, Peggy.buildRule(this, declaration), null, Peggy.Executions.not);
		rule.type = 'not';
		return rule;
	},

	/*
		Returns an array that is considered a NonTerminal.
		It is a collection of rules each built by the Peggy#buildRule function.
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

			// TODO: Make this scope work for all rules and provide a #clearScopes func
			// clear the scope for every parse so that info is not persisted across different parse
			root.scope = {};

			if(this.instrument) console.log('Begin ' + this.name + '#parse');
			tree = Peggy.Engine.process(root, input);
			if(this.instrument) console.log('End ' + this.name + '#parse', tree, root);

			if (tree.count === 0) throw 'Failed to parse "' + tree.original + '"';

			if(this.instrument) console.log('Begin ' + this.name + '#match');
			match = new Peggy.Match(tree, this.instrument);
			result = match.result(root);
			if(this.instrument) console.log('End ' + this.name + '#match', result, root);

			return this.completed.call(root.scope, result[root.name]);
		} else {
			throw this.name + ' has no rules to parse with.';
		}
	}
};