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
		this.exts = ext;
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

	var execute = function(rule, tree){
		if(!isRule(rule)) rule = this.resolve(rule);
		// the condition on rule type is because sometimes it's a regex
		tree = setCurrent.call(this, rule, tree);
		return executions[rule.type || getType(rule)].call(this, rule, tree);
	};

	var setCurrent = function(rule, tree){
		this.current = rule.name || rule;
		if(!tree[this.current]) tree[this.current] = {};
		this.currentNode = tree;
		return tree[this.current];
	};

	var addToTree = function(match, tree){
		if(_.isObject(this.node[this.name]) && _.isEmpty(this.node[this.name])){
			this.node[this.name] = match;
		} else {
			if(!_.isArray(this.node[this.name])){
				this.node[this.name] = [this.node[this.name]];
			}
			this.node[this.name].push(match);
		}
	};

	var executions = {
		// API for executions: r = rule, t = tree, RETURN boolean
		// sequence
		"..": function(r, t){
			var exec = this.exts[this.current];
			var args = [];
			var all = _.all(r.decl, function(rule){ 
				var i = execute.call(this, rule, t); 
				args.push(this.currentNode[this.current]);
				return i;
			}, this);
			if(all) {
				if(exec) exec.apply(this, args);
				return true;
			} else {
				return false;
			}
		},
		// oneOrMore
		"+": function(r, t){
			var count = 0, rule = distill.call(this, r);
			var exec = this.exts[this.current];
			var args = [];
			while(execute.call(this, rule[1], t)){
				count ++; 
				args.push(this.currentNode[this.current]);
			}
			if(count >= 1){
				if(exec) exec.apply(this, args);
				return true;
			} else {
				return false;
			}
		},
		// zeroOrMore
		"*": function(r, t){
			var rule = distill.call(this, r);
			var exec = this.exts[this.current];
			var args = [];
			while(execute.call(this, rule[1], t)){
				args.push(this.currentNode[this.current]);
			}
			if(exec) exec.apply(this, args);
			return true;
		},
		// terminal
		".": function(r, t){
			var context = {node: this.currentNode};
			// sometimes we get full rules - we just want regexp
			if(!_.isRegExp(r)){
				context.name = r.name;
				r = r.decl;
			} else {
				context.name = r.toString();
			}
			var match = this.input.scan(r);
			if(match){
				addToTree.call(context, match, t);
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
