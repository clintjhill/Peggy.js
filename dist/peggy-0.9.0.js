(function() {
	var Peggy;
	((typeof exports !== "undefined" && exports !== null) ? exports : this).Peggy = (function() {
		/*
			Constructor for building a Peggy Grammar. 
		*/
		Peggy = function(name) {
			if (!name) {
				throw 'A grammar name is required';
			}
			this.name = name;
			this.rules = {
				count: 0
			};
			return this;
		};

		Peggy.version = "0.9.0";

		var jsTypes = "Boolean Number String Function Array Date RegExp Object".split(" ");

		Peggy.types = {};
		// Build the types collection based on JavaScript object definitions
		for (var t = 0; t < jsTypes.length; t++) {
			Peggy.types["[object " + jsTypes[t] + "]"] = jsTypes[t].toLowerCase();
		}

		/*
			Used to determine the type of JavaScript object. Returns a lower case
			version of all the JavaScript data types.
		*/
		Peggy.type = function(declaration) {
			return Peggy.types[Object.prototype.toString.call(declaration)];
		};

		/*
			Used to determine the 'type' of a rule by the contents of its 
			declaration. This is useful when the declaration isn't wrapped in a standard
			Rule model. Possible returns:

			* terminal
			* alias
			* stringTerminal
			* sequence
			* choice
			* repeat
			* rule (in the event there is no need to translate)
		*/
		Peggy.ruleType = function(declaration) {
			var type = Peggy.type(declaration);
			if (type === 'regexp') return 'terminal';
			if (type === 'string') {
				if (declaration.charAt(0) === ':') return 'alias';
				return 'stringTerminal';
			}
			if (type === 'array') {
				return declaration.type;
			}
			if (type === 'object') {
				return 'rule';
			}
		};

		/*
			Builds a rule. This is the core building function in which the
			declaration of the rule is translated to one of the rule types. 
		*/
		Peggy.buildRule = function(grammar, declaration, extension) {
			var type = Peggy.ruleType(declaration);
			if(type === 'rule') return declaration;
			return {
				grammar: grammar,
				type: type,
				declaration: declaration,
				// extension is a function with a value param
				extension: extension,
				isTerminal: type === 'terminal' || type === 'stringTerminal'
			};
		};

		/*
			Returns the full Rule for the alias provided. Searches against
			the rules collection by the name of the rule. 
		*/
		Peggy.resolveAlias = function(grammar, alias) {
			alias = alias.charAt(0) === ':' ? alias.substr(1) : alias;
			for (var i = 0; i < grammar.rules.count; i++) {
				if (grammar.rules[i].name === alias) {
					return grammar.rules[i];
				}
			}
		};

		/*
			Prototype for Peggy instances that includes the API to build 
			a Grammar:

			* root()
			* rule()
			* repeat()
			* sequence()
			* choice()
		*/
		Peggy.prototype = {

			/*
				Builds a rule and declares it as root by setting it
				against the rules collection in the 'root' property.
				Root is where all the parsing of the grammar will begin.
			*/
			root: function(name, declaration, extension) {
				var root = this.rule(name, declaration, extension);
				this.rules.root = root;
			},

			/*
				Builds a rule, adds it to the collection and returns it.
			*/
			rule: function(name, declaration, extension, debugEngine, debugMatch) {
				var rule = Peggy.buildRule(this, declaration || name, extension);
				rule.name = name;
				// These debug flags will add debugger breakpoints at runtime if the
				// grammar declares these booleans. Use at your own advantage and risk.
				rule.debugEngine = debugEngine;
				rule.debugMatch = debugMatch;
				this.rules[this.rules.count] = rule;
				this.rules.count += 1;
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
				Builds a Repeat rule. Defaults min to 1 and max to Infinity. 
			*/
			repeat: function(name, rule, min, max, extension) {
				return {
					name: name,
					declaration: Peggy.buildRule(this, rule),
					min: min || 1,
					max: max || 1.0 / 0,
					extension: extension,
					type: 'repeat'
				};
			},

			oneOrMore: function(name, rule, extension) {
				return this.repeat(name, rule, null, null, extension);
			},

			zeroOrMore: function(name, rule, extension) {
				return this.repeat(name, rule, 0, null, extension);
			},

			zeroOrOne: function(name, rule, extension) {
				return this.repeat(name, rule, 0, 1, extension);
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
						// match object built against the root rule and the input
						match = new Peggy.Match(Peggy.Engine.process(root, input)),
						result = match.result();
					// Return the value of the root rule whether it is extended or not
					if (result[root.name]) {
						return (root.extension) ? root.extension(result[root.name].value) : result[root.name].value;
					}
				}
			}
		};

		/*
			Collection of NonTerminal types for the prototype API
		*/
		Peggy.nonTerminals = "sequence choice any all".split(" ");

		/*
			Constructs a function for a NonTerminal API 
		*/
		var nonTerminalFunction = function(func) {
			return function() {
				var rules = this.nonTerminal(arguments);
				rules.type = func;
				return rules;
			};
		};

		// Iterate NonTerminal types and add them to the Peggy.prototype
		for (var i = 0; i < Peggy.nonTerminals.length; i++) {
			var type = Peggy.nonTerminals[i];
			Peggy.prototype[type] = nonTerminalFunction(type);
		}

		Peggy.StringScanner = function(source) {
			this.source = source.toString();
			this.reset();
			return this;
		};
		
		Peggy.StringScanner.prototype.scan = function(regexp) {
			var matches = regexp.exec(this.getRemainder());
			return (matches && matches.index === 0) ? this.setState(matches, { head: this.head + matches[0].length, last: this.head }) : this.setState([]);
		};
		
		Peggy.StringScanner.prototype.getRemainder = function() {
			return this.source.slice(this.head);
		};
		
		Peggy.StringScanner.prototype.setState = function(matches, values) {
			var _a, _b;
			this.head = (typeof(_a = ((typeof values === "undefined" || values === null) ? undefined: values.head)) !== "undefined" && _a !== null) ? _a: this.head;
			this.last = (typeof(_b = ((typeof values === "undefined" || values === null) ? undefined: values.last)) !== "undefined" && _b !== null) ? _b: this.last;
			this.captures = matches.slice(1);
			return (this.match = matches[0]);
		};
		
		Peggy.StringScanner.prototype.getSource = function() {
			return this.source;
		};

		Peggy.StringScanner.prototype.reset = function() {
		  return this.setState([], {
			head: 0,
			last: 0
		  });
		};

		/*
			Peggy Rules engine. 
		*/
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
					if (!rule) throw 'Failed to parse: ' + name + ' rule is not defined.';
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
					count: 0,
					originalString: input.getSource()
				};
			},

			/*
				Helper function to sanitize a declaration that is actually
				intended to be used as a Regular Expression. This will guard
				for single character Regular Expression reserved characters and 
				escape for those.
			*/
			safeRegExp: function(declaration) {
				if (declaration.length === 1 && /\W/.test(declaration)) {
					return new RegExp('\\' + declaration);
				} else if(declaration.charAt(0) === '/' && declaration.charAt(declaration.length-1) === '/') {
					return new RegExp(declaration.substring(1, declaration.length-1));
				} else {
					return new RegExp(declaration);
				}
			},

			/* 
				Returns the tree parameter with the addition of 
				any matched content. This addition is a leaf to the tree.
			*/
			terminal: function(rule, input, tree) {
				
				if(rule.debugEngine) { debugger; }

				var regex = (rule.type === 'stringTerminal') ? this.safeRegExp(rule.declaration) : rule.declaration,
					match = input.scan(regex);
				
				if (match) {
					// add a leaf to the tree
					tree[tree.count] = { rule: rule, string: match };
					tree.count += 1;
				}
				return tree;
			},

			/*
				Returns the tree parameter with the addition of
				any matched content. This addition is a branch to the tree.
			*/
			nonTerminal: function(rule, input, tree) {
				
				if(rule.debugEngine) { debugger; }

				var
					// set the branch with the rule it supports 
					branch = { rule: rule, count: 0, string: '' },
					// guard for match count before repeat rule processing
					originalCount = 0,
					// iterator for declarations
					i, 
					// iterator for string concat on branch
					s, 
					// helper to add branch to return tree
					addToTree = function(sub){
						tree[tree.count] = sub;
						tree.count += 1;
					};

				if(Peggy.type(rule.declaration) === 'array') {
					for (i = 0; i < rule.declaration.length; i++) {
						branch = this.process(rule.declaration[i], input, branch);
					}	
				} else if(rule.type === 'repeat') {
					do{	
						originalCount += branch.count;
						branch = this.process(rule.declaration, input, branch);
					} while(branch.count > originalCount);
				}

				// if there are matches we need to aggregate the 
				// strings from all sub-matches to the root match
				if(branch.count > 0){
					for(s = 0; s < branch.count; s++){
						branch.string += branch[s].string;
					}
				}

				if(rule.type === 'sequence' || rule.type === 'any'){
					if(branch.count > 0){
						addToTree(branch);
					}
				} else if(rule.type === 'all'){
					if(branch.count === rule.declaration.length){
						addToTree(branch);
					}
				} else if(rule.type === 'choice'){
					if(branch.count === 1){
						addToTree(branch);
					}
				} else if(rule.type === 'repeat'){
					if(branch.count >= rule.min && branch.count <= rule.max){
						addToTree(branch);
					}
				}

				return tree;
			},

			process: function(rule, input, tree) {
				rule = this.resolve(rule);
				tree = this.defaultTree(input, tree);
				if (rule.isTerminal) {
					return this.terminal(rule, input, tree);
				} else {
					return this.nonTerminal(rule, input, tree);
				}
			}
		};

		/*
			Constructor for matches against the rule tree. The tree is made up of rule nodes 
			and the matching strings they collected from scanning the input during
			Peggy.prototype.parse.
		*/
		Peggy.Match = function(tree) {
			if (typeof tree === 'undefined') throw 'Tree must be defined for Match';
			if (tree.count === 0) throw 'Failed to parse "' + tree.originalString + '"';
			this.tree = tree;
			this.captures = {};
			return this;
		};

		/*
			Prototype for Peggy.Match instances. 
		*/
		Peggy.Match.prototype = {

			/*
				Executes the capturing process for the tree values. Iterates
				over the tree and processes each match along the way.
			*/
			capture: function(tree) {
				var m; // iterator for tree loop
				if (!tree.count) {
					// if the tree has no count it is the end of a branch
					this.processMatch(tree);
				} else {
					// capture for every node in the tree (capture deep)
					for (m = 0; m < tree.count; m++) {
						this.capture(tree[m]);
					}
					// capture for the tree (go shallow)
					this.processMatch(tree);
				}
			},

			// Helper to index the captures and prevent duplication of names
			captureId: 0,

			/*
				Process the match for values. Builds the capture with the matches
				string and the value. The value is delegated to Peggy.Match.prototype.getValues.
				Finally add the captured match to the captures tree.
			*/
			processMatch: function(match) {
				var c;
				// if the match has a rule process it, otherwise
				// it's likely the root and safe to skip.
				// TODO: Better check - check for root?
				if (match.rule) {
					c = { match: match.string, value: this.getValues(match) };
					this.safeCollect(this.captures, match.rule.name || this.captureId, c);
					this.captureId += 1;
				}
			},

			/*
				Returns the value of provided match. Performs checks against 
				the match Rule to properly calculate value against Terminal types
				or whether there is an extension to perform against the match.
			*/
			getValues: function(match) {
				var 
					// return object (used only in NonTerminal values)
					value = {}, 
					// iterator for matches
					i,
					// rule placeholder in matches loop
					rule;

				// Terminals are easy - return the extension or the string as the value
				if (match.rule.isTerminal) {
					if(match.rule.debugMatch) { debugger; }
					return (match.rule.extension)  ? match.rule.extension(match.string)  : match.string;
				} else {
				// NonTerminals are harder
					for (i = 0; i < match.count; i++) {
						// rule to process values against
						rule = match[i].rule;
						if(rule.debugMatch) { debugger; }
						// if this match rule is Terminal - recurse for values
						if (rule.isTerminal) {
							value[rule.name || i] = this.getValues(match[i]);
						} else {
							// add to the value object the value of rule extension or recurse for values
							this.safeCollect(
								value, // the current value object for return from this function
								rule.name || this.captureId, // a key to place the value against
								(rule.extension) ? rule.extension(this.getValues(match[i])) : this.getValues(match[i]));
							this.captureId += 1;
						}
					}
					return value;
				}
			},

			/*
				Helper function to add an object to another object while preventing
				overwrites. If key exists it will safely create an array for the key so all
				values are preserved.
			*/
			safeCollect: function(collector, key, value) {
				if (collector[key]) {
					if (Peggy.types[toString.call(collector[key])] !== 'array') {
						collector[key] = [collector[key]];
						collector[key].push(value);
					}
				} else {
					collector[key] = value;
				}
			},

			/*
				Returns the captured values as a heirarchal node list based on the
				structure of the Grammar.
			*/
			result: function() {
				this.capture(this.tree);
				return this.captures;
			}
		};

		return Peggy;
	})();
})();
