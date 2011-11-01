Peggy.engine = (function(){
	
	var resolve = function(rule){
		if(rule.type === 'alias'){
			var name = rule.declaration.substr(1);
			rule = rule.grammar.resolveRule(rule.declaration);
			rule.name = name;
		}
		return rule;
	};
	
	var defaultTree = function(input, tree){
		// base tree model
		tree = tree || { count: 0, originalString: input.getSource() };
		return tree;
	};
	
	var terminal = function(rule, input, tree){
		var regex = (rule.type === 'stringTerminal') ? 
			new RegExp('\\' + rule.declaration) : 
			rule.declaration;
		var match = input.scan(regex);
        if (match) {
			// add a leaf to the tree
			tree[tree.count] = { rule: rule, string: match };
			tree.count += 1;
        }
		return tree;
	};
	
	var nonTerminal = function(rule, input, tree){
		// set the branch with the rule it supports
		var subtree = {rule: rule, count: 0};
		for(var i = 0; i < rule.declaration.length; i++){
			// build a branch for the tree
			subtree = process(rule.declaration[i], input, subtree);
			var matched = '';
			for(var se = 0; se < subtree.count; se++){
				if(subtree[se].string){
					matched += subtree[se].string;
				}
			}
			subtree.string = matched;
		}
		//TODO: Add logic here to specify sequence/count/repeat event success
		// when a branch has leaves/branches process them and add to tree
		if(subtree.count > 0) {
			if(rule.declaration.sequence){
				tree[tree.count] = subtree;
				tree.count += 1;
			} else if(rule.declaration.choice && subtree.count === 1){
				tree[tree.count] = subtree;
				tree.count += 1;
			} else {
				// do nothing - nonterminal fail?
			}
		}
		return tree;
	};
	
	var process = function(rule, input, tree){
		rule = resolve(rule);
		tree = defaultTree(input, tree);
		if(rule.isTerminal) {
			return terminal(rule, input, tree);
		} else {
			return nonTerminal(rule, input, tree);
		}
	};
	
	return {
		process: process
	};
	
})();
