(function(){

	var root = this;

	var sequence = "..",
		choice = "||",
		zeroOrMore = "*",
		oneOrMore = "+",
		and = "&",
		not = "!",
		optional = "?",
		terminal = ".";

	var ruleFlags = [choice, zeroOrMore, oneOrMore, and, not, optional];

	var Peggy = function(def, ext){
		this.exts = ext || {};
		this.rules = [];
		_.each(def, function(rule, key){
			this.rules.push({
				name: key,
				decl: rule,
				type: getType(rule)
			});
		}, this);
	};

	Peggy.version = "<%= pkg.version %>";

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Peggy;
		}
		exports.Peggy = Peggy;
	} else {
		root.Peggy = Peggy;
	}

	Peggy.prototype = {
		parse: function(val){
			this.input = new Peggy.StringScanner(val);
			this.tree = {};
			if(execute.call(this, this.root(), this.tree)){
				return this.tree;
			} else {
				throw "Failed to parse tree.";
			}
		},
		root: function(){
			return this.rules[0];
		},
		resolve: function(name){
			if(_.isArray(name)){
				return { name: 'nested', decl: name, type: getType(name) };
			} else {
				return _.find(this.rules, function(rule){ return rule.name === name; });
			}
		}
	};

	/*
		Every single rule will be executed through this function.
	*/
	var execute = function(rule, tree){
		if(!isRule(rule)) rule = this.resolve(rule);
		// the condition on rule type is because sometimes it's a regex
		tree = setCurrent.call(this, rule, tree);
		return executions[rule.type || getType(rule)].call(this, rule, tree);
	};

	var setCurrent = function(rule, tree){
		// the rule that is currently being 'executed'
		this.current = rule.name || rule;
		// set up the tree with the rule's label
		tree[this.current] = tree[this.current] || {};
		// the node that is currently being populated
		this.currentNode = tree;
		// return the tree labeled by the current rule for processing
		return tree[this.current];
	};

	var getCurrent = function(){
		return {name: this.current, node: this.currentNode, ext: this.exts[this.current]};
	};

	var applyExtension = function(args, current, tree){
		if(current.ext){
			var val = current.ext.apply(current.node, args);
			if(val){
				current.node[current.name] = val;
			}
		}
	};

	var getArgument = function(tree, rule){
		return (_.isObject(tree)) ? tree[rule] || tree[rule[1]] || tree.nested[rule[1]] : tree;
	};

	var executions = {
		// API for executions: r = rule, t = tree, RETURN boolean
		// sequence
		"..": function(r, t){
			var current = getCurrent.call(this);
			var args = [];
			var all = _.all(r.decl, function(rule){ 
				var i = execute.call(this, rule, t); 
				// add argument for extension if not by name then by nested anonymous name
				args.push(getArgument(t, rule));
				return i;
			}, this);
			if(all) {
				applyExtension(args, current, t);
				return true;
			} else {
				return false;
			}
		},
		// oneOrMore
		"+": function(r, t){
			var count = 0, rule = distill.call(this, r);
			var current = getCurrent.call(this);
			var args = [];
			while(execute.call(this, rule[1], t)){
				count ++;
				args.push(getArgument(t, rule)); 
			}
			if(count >= 1){
				applyExtension(args, current, t);
				return true;
			} else {
				return false;
			}
		},
		// zeroOrMore
		"*": function(r, t){
			var rule = distill.call(this, r);
			var current = getCurrent.call(this);
			var args = [];
			while(execute.call(this, rule[1], t)){
				args.push(getArgument(t, rule));
			}
			applyExtension(args, current, t);
			return true;
		},
		// terminal
		".": function(r, t){
			var name, exec = this.exts[this.current];
			var current = getCurrent.call(this);
			// sometimes we get full rules - we just want regexp
			if(!_.isRegExp(r)){
				name = r.name;
				r = r.decl;
			} else {
				name = r.toString();
			}
			var match = this.input.scan(r);
			if(match){
				applyExtension([match], current, t);
				this.currentNode[name] = match;
				return true;
			} else {
				return false;
			}
		}
	};

	var distill = function(rule){
		if(!_.isArray(rule) && _.isObject(rule)) return rule.decl;
		if(_.isArray(rule) && rule.length === 2) rule = rule[1];
		return this.resolve(rule).decl;
	};

	var isRule = function(rule){
		return !_.isString(rule) && !_.isArray(rule) && _.isObject(rule);
	};

	var isSequence = function(rule){
		return _.isArray(rule) && !_.contains(ruleFlags, _.first(rule));
	};

	var isChoice = function(rule){
		return _.isArray(rule) && _.first(rule) === choice;
	};

	var isOneOrMore = function(rule){
		return _.isArray(rule) && _.first(rule) === oneOrMore;
	};

	var isZeroOrMore = function(rule){
		return _.isArray(rule) && _.first(rule) === zeroOrMore;
	};

	var isTerminal = function(rule){
		return _.isRegExp(rule);
	};

	var getType = function(decl){
		if(isSequence(decl)) return sequence;
		if(isChoice(decl)) return choice;
		if(isOneOrMore(decl)) return oneOrMore;
		if(isZeroOrMore(decl)) return zeroOrMore;
		if(isTerminal(decl)) return terminal;
	};

}).call(this);
