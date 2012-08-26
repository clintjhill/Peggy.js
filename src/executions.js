Peggy.Executions = (function(){

	var process = Peggy.Engine.process,

	/*
		This is the core execution wherein the input is scanned for the RegExp. All roads lead
		to this execution.
	*/
	terminal = function(input, tree) {
		var regex = (this.type === 'stringTerminal') ? safeRegExp(this.declaration) : this.declaration,
			match = input.scan(regex);
		if (match) {
			// add a leaf to the tree
			tree[tree.count] = { rule: this, match: match };
			tree.count += 1;
		} else {
			if(this.grammar.instrument){
				console.log('executions#terminal - Did not find a match for ' + this.declaration + ' in "' + input.getRemainder() + '"');
			}
		}
		return tree;
	},

	/*
		Helper function to sanitize a declaration that is actually
		intended to be used as a Regular Expression. This will guard
		for single character Regular Expression reserved characters and 
		escape for those.
	*/
	safeRegExp = function(declaration) {
		if (declaration.length === 1 && /\W/.test(declaration)) {
			return new RegExp('\\' + declaration);
		} else if(declaration.charAt(0) === '/' && declaration.charAt(declaration.length-1) === '/') {
			return new RegExp(declaration.substring(1, declaration.length-1));
		} else {
			return new RegExp(declaration);
		}
	},

	/*
		Helper function to create a fresh branch for use in the top of 
		a processing. Sets the rule and sets the count to 0. Match is empty.
	*/
	createBranch = function(rule) {
		return { rule: rule, count: 0, match: '' };
	},

	updateMatch = function(branch){
		if(branch.count > 0){
			for(var s = 0; s < branch.count; s++){
				// check for a matching branch (some rules don't consume input)
				if(branch[s] && !branch[s].elided){
					if(!branch.match) branch.match = '';
					branch.match += branch[s].match;
				}
			}
		}
		return branch;
	},

	updateTree = function(tree, branch, elided) {
		updateMatch(branch);
		// if the rule execution wants to block the match from showing
		// up later in a Match, let's add a flag to the tree.
		if(elided){
			tree[tree.count] = { rule: branch.rule, elided: true };
		} else {
			tree[tree.count] = branch;
		}
		tree.count += 1;
		return tree;
	};

	return {

		terminal: terminal,

		stringTerminal: terminal,

		choice: function(input, tree) {
			var i, branch = createBranch(this);
			for (i = 0; i < this.declaration.length; i++) {
				branch = process(this.declaration[i], input, branch);
				if(branch && branch.count > 0) {
					return updateTree(tree, branch);
				}
			}
		},

		sequence: function(input, tree) {
			var i, branch = createBranch(this), head = input.head, last = input.last;
			for (i = 0; i < this.declaration.length; i++) {
				branch = process(this.declaration[i], input, branch);
				if(!branch){ // fail fast out of sequence - don't bother doing more
					if(this.grammar.instrument) console.log('executions#sequence - Failed', this.declaration[i], input.getRemainder());
					input.reset(head, last);
					return;
				}
			}
			if(branch && branch.count === this.declaration.length){
				if(this.grammar.instrument) console.log('executions#sequence', tree, branch);
				return updateTree(tree, branch);
			} else {
				input.reset(head, last);
			}
		},

		any: function(input, tree) {
			var i, any = createBranch(this);
			for(i = 0; i < this.declaration.length; i++) {
				if(process(this.declaration[i], input, any).count > 0){
					updateTree(tree, any);
				}
				any = createBranch(this);
			}
			return tree;
		},

		repeat: function(input, tree) {
			var attempts = 0, branch;
			do{					
				branch = createBranch(this);
				var r = process(this.declaration, input, branch);
				if(r && r.count > 0){
					tree = updateTree(tree, branch);
				} else {
					branch = false; // short-circuit the while loop
				}
				attempts += 1;
			} while(branch && attempts >= this.min && attempts < this.max && input.hasMore());
			return tree;
		},

		zeroOrMore: function(input, tree){
			debugger;
			return tree;
		},

		not: function(input, tree) {
			var branch = createBranch(this);
			branch = process(this.declaration, input, branch);
			if(branch && branch.count === 0){
				return updateTree(tree, branch, true);
			}
		},

		and: function(input, tree) {
			var branch = createBranch(this);
			branch = process(this.declaration, input, branch);
			if(branch && branch.count > 0){
				return updateTree(tree, branch, true);
			}
		}
	};
})();