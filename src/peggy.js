(function(){

	/*
		Symbols for the types of rules that can be created with Peggy.	
	*/
	var sequence = "..",
		choice = "||",
		zeroOrMore = "*",
		oneOrMore = "+",
		and = "&",
		not = "!",
		optional = "?",
		terminal = ".";

	/*
		Collection of the types of rules for use in rule detection.
	*/
	var ruleFlags = [choice, zeroOrMore, oneOrMore, and, not, optional];

	/*
		Predicate to determine that an Object is a Rule.
		Requires a 'name', 'type' and 'decl' property on 
		an Object in order to be a Rule.
	*/
	var isRule = function(rule){
		return !_.isString(rule) &&
			!_.isArray(rule) && 
			_.isObject(rule) && 
			_.has(rule, 'name') && 
			_.has(rule, 'type') && 
			_.has(rule, 'decl');
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

	/*
		Determines the type of Rule and returns the respective symbol.
	*/
	var getType = function(decl){
		if(isSequence(decl)) return sequence;
		if(isChoice(decl)) return choice;
		if(isOneOrMore(decl)) return oneOrMore;
		if(isZeroOrMore(decl)) return zeroOrMore;
		if(isTerminal(decl)) return terminal;
	};

	/*
		Constructor to build a Peggy grammar.
	*/
	var Peggy = function(def, ext){
		var rule = {};
		this.exts = ext || {};
		this.rules = [];
		_.each(def, function(decl, key){
			rule = {
				name: key.toString(),
				decl: decl,
				type: getType(decl)
			};
			if(rule.type !== sequence && rule.type !== terminal){
				rule.decl = rule.decl[1];
			}
			this.rules.push(rule);
		}, this);
	};

	Peggy.version = "<%= pkg.version %>";

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Peggy;
		}
		exports.Peggy = Peggy;
	} else {
		this.Peggy = Peggy;
	}

	Peggy.prototype = {
		parse: function(val){
			// the string value to scan for matches
			this.input = new Peggy.StringScanner(val);
			// the match tree built from scanner
			this.tree = {};
			// ID tracker for match events (increments on every match) and
			// also used as a way to sync on oneOrMore & zeroOrMore rules.
			this.eventId = 0;
			// peform the scan and find matches
			if(execute.call(this, this.root(), this.tree)){
				return this.tree;
			} else {
				throw "Failed to parse tree.";
			}
		},
		/*
			This is used to provide sync on the One or More and Zero or More
			rules. Matches in those rules are considered a part of the same
			match event while others are individual events.
		*/
		pauseEvents: function(execution){
			this.eventId++; // push an event to provide new ID for this rule
			this.stopEvents = true; // event increment will stop
			execution.call(this);
			this.stopEvents = false; // event increment will start
		},
		root: function(){
			return this.rules[0];
		},
		/*
			Resolves rules by name. If name is an Array and is not a Sequence
			it will inspect for the Rule. If it is a regular expression it
			wraps it in Object form with a name, decl and type property.
		*/
		resolve: function(name){
			if(_.isRegExp(name)){
				// Eg. name = /\d/
				return {
					name: name.toString(),
					decl: name,
					type: terminal
				};				
			} else if(_.isArray(name) && !isSequence(name)){
				// Eg. name = ["+", /\d/]
				return {
					name: name[1].toString(),
					decl: name[1],
					type: getType(name)
				};
			} else {
				// Eg. name = "whitespace"
				return _.find(this.rules, function(rule){ 
					return rule.name === name; 
				});
			}
		}
	};

	/*
		Every single rule will be executed through this function.
		Initial call sends "parse" instance tree, not interstitial tree.
	*/
	var execute = function(rule, tree){
		if(!isRule(rule)) {
			rule = this.resolve(rule);
		}
		return executions[rule.type].call(this, rule, tree);
	};

	var getArgument = function(tree, rule){
		if(!isRule(rule)) {
			rule = this.resolve(rule);
		}
		var arg, eventId = this.eventId;
		if(_.isArray(tree[rule.name]) || _.isObject(tree[rule.name])){
			_.each(tree[rule.name], function(match, index){
				if(_.isArray(match)){
					arg = [];
					_.each(match, function(innerMatch){
						if(innerMatch.eventId === eventId){
							arg.push(innerMatch.value);
						}
					});
				} else if(_.isObject(match)) {
					if(match.eventId === eventId){
						if(index == 1){
							arg = [arg];
						}
						if(_.isArray(arg)){
							arg.push(match.value);
						} else {
							arg = match.value;
						}						
					}	
				} else {
					arg = match;
				}			
			});
		} else {
			arg = tree[rule.name];
		}
		return arg;
	};

	var updateTree = function(values, tree, rule){
		var value;
		if(this.exts[rule.name]){
			value = this.exts[rule.name].apply(tree, values);
		} else {
			value = { 
				// if events are stopped we want the same eventId on matches
				eventId: (this.stopEvents) ? this.eventId : ++this.eventId, 
				value: values 
			};
		}
		if(tree[rule.name] && !_.isArray(tree[rule.name])){
			tree[rule.name] = [tree[rule.name]];
		}
		if(_.isArray(tree[rule.name])) {
			tree[rule.name].push(value);
		} else {
			tree[rule.name] = value;
		}
	};

	/*
		Executions are the logic for each Rule type. They are identified by
		the Rule Symbol and return boolean to determine success.

		Each execution requires the Rule and the current Tree.
	*/
	var executions = {
		// sequence
		"..": function(r, t){
			var args = [];
			var all = _.all(r.decl, function(rule){ 
				var i = execute.call(this, rule, t); 
				args.push(getArgument.call(this, t, rule));
				return i;
			}, this);
			if(!all) return false;
			updateTree.call(this, args, t, r);
			return true;
		},
		// oneOrMore
		"+": function(r, t){
			var count = 0, args = [];
			this.pauseEvents(function(){
				while(execute.call(this, r.decl, t)){ 
					count++; 
					args.push(getArgument(t, r)); 
				}	
			});
			if(count < 1) {
				this.eventId--;
				return false;
			}
			updateTree.call(this, args, t, r);
			return true;
		},
		// zeroOrMore
		"*": function(r, t){
			var count = 0, args = [];
			this.pauseEvents(function(){			
				while(execute.call(this, r.decl, t)){
					count++; 
					args.push(getArgument(t, r)); 
				}
			});
			if(count < 1){
				this.eventId--;
			}
			updateTree.call(this, args, t, r);
			return true;
		},
		// terminal
		".": function(r, t){
			var match = this.input.scan(r.decl);
			if(!match) return false;
			updateTree.call(this, [match], t, r);
			return true;
		}
	};

}).call(this);