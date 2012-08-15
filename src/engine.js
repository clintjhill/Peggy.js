Peggy.Engine = {
	/*
		Pass through to resolve alias type rules. Requires the
		rule to specify type. Delegates to the grammar instance alias
		resolver.
	*/
	resolve: function(rule) {
		if (rule.type === 'alias') {
			var name = rule.declaration.substr(1);
			rule = Peggy.resolveAlias(rule.grammar, rule.declaration);
			if (!rule) {
				throw 'Failed to resolve from the engine: "' + name + '" rule is not defined.';
			}
			rule.name = name;
		}
		return rule;
	},

	/* 
		Returns the tree as provided, or initializes
		a default tree with 0 count and original String.
		The tree is the node list of rules and matches heirarchally 
		orgainzed per Grammar.
	*/
	defaultTree: function(input, tree) {
		// base tree model
		return tree || {
			count: 0, // the number of sub-rules processed in this tree
			originalString: input.getSource()
		};
	},

	/*
		Processes a rule against an input and aggregates the tree with the result.
	*/
	process: function(rule, input, tree) {
		rule = this.resolve(rule);
		tree = this.defaultTree(input, tree);
		if(rule.instrument) console.log('engine#process', rule.name);
		return rule.execute(input, tree);
	}
};