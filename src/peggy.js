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
		tree = setCurrent.call(this, rule, tree);
		return executions[rule.type].call(this, rule, tree);
	};

	var setCurrent = function(rule, tree){
		// the rule that is currently being 'executed'
		this.current = rule.name;
		// set up the tree with the rule's label
		tree[this.current] = tree[this.current] || { fresh: true };
		// the node that is currently being populated
		this.currentNode = tree;
		// return the tree labeled by the current rule for processing
		return tree[this.current];
	};

	var getCurrent = function(){
		// this is an object to help build the tree in interstitial states
		return {
			name: this.current, 
			node: this.currentNode, 
			ext: this.exts[this.current]
		};
	};

	var getArgument = function(tree, rule){
		if(!isRule(rule)) {
			rule = this.resolve(rule);
		}
		var val, eventId = this.eventId;
		if(_.isArray(tree[rule.name]) || _.isObject(tree[rule.name])){
			_.each(tree[rule.name], function(match){
				if(_.isArray(match)){
					val = [];
					_.each(match, function(innerMatch){
						if(innerMatch.eventId === eventId){
							val.push(innerMatch.value);
						}
					});
				} else if(_.isObject(match)) {
					if(match.eventId === eventId){
						val = match.value;
					}	
				} else {
					val = match;
				}			
			});
		} else {
			val = tree[rule.name];
		}
		return val;
	};

	var setValue = function(args, current){
		if(args){
			// set the value with an event id
			var val = { 
				// if events are stopped we want the same eventId on matches
				eventId: (this.stopEvents) ? this.eventId : ++this.eventId, 
				value: args 
			};
			if(_.isArray(current.node[current.name])) {
				current.node[current.name].push(val);
			} else {
				if(current.node[current.name].fresh){
					current.node[current.name] = val;	
				} else {
					if(!_.isArray(current.node[current.name])){
						current.node[current.name] = [current.node[current.name]];
					}
					current.node[current.name].push(val);
				}
			}
		}
	};

	var extend = function(values, current){
		if(current.ext){
			var val = current.ext.apply(current.node, values);
			if(val){
				if(!current.node[current.name].peggyExt){
					current.node[current.name] = val;
					current.node[current.name].peggyExt = true;	
				} else {
					if(_.isObject(val)){
						_.extend(current.node[current.name], val);
					} else {
						current.node[current.name] = val;
						current.node[current.name].peggyExt = true;	
					}
				}				
			}
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
			var args = [], current = getCurrent.call(this);
			var all = _.all(r.decl, function(rule){ 
				var i = execute.call(this, rule, t); 
				args.push(getArgument.call(this, t, rule));
				return i;
			}, this);
			if(!all) return false;
			extend.call(this, args, current);
			return true;
		},
		// oneOrMore
		"+": function(r, t){
			var count = 0, args = [], current = getCurrent.call(this);
			// make this a wrapping function instead of flags on each boundary
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
			extend.call(this, args, current);
			return true;
		},
		// zeroOrMore
		"*": function(r, t){
			var count = 0, args = [], current = getCurrent.call(this);
			this.pauseEvents(function(){			
				while(execute.call(this, r.decl, t)){
					count++; 
					args.push(getArgument(t, r)); 
				}
			});
			if(count < 1){
				this.eventId--;
			}
			extend.call(this, args, current);
			return true;
		},
		// terminal
		".": function(r, t){
			var current = getCurrent.call(this);
			var match = this.input.scan(r.decl);
			if(!match) return false;
			setValue.call(this, match, current);
			extend.call(this, [match], current);
			return true;
		}
	};

}).call(this);