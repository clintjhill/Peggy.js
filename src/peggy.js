(function() {
	var Peggy;
	((typeof exports !== "undefined" && exports !== null) ? exports: this).Peggy = (function() {

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

		Peggy.version = "@VERSION";

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
			rule: function(name, declaration, extension) {
				var rule = this.buildRule(declaration || name, extension);
				rule.name = name;
				this.rules[this.rules.count] = rule;
				this.rules.count += 1;
				return rule;
			},

			/*
				Builds a rule. This is the core building function in which the
				declaration of the rule is translated to one of the rule types. 
			*/
			buildRule: function(declaration, extension) {
				var type = Peggy.ruleType(declaration);
				if(type === 'rule') return declaration;
				return {
					grammar: this,
					type: type,
					declaration: declaration,
					// extension is a function with a value param
					extension: extension,
					isTerminal: type === 'terminal' || type === 'stringTerminal'
				};
			},

			/*
				Returns the full Rule for the alias provided. Searches against
				the rules collection by the name of the rule. 
			*/
			resolveAlias: function(alias) {
				alias = alias.charAt(0) === ':' ? alias.substr(1) : alias;
				for (var i = 0; i < this.rules.count; i++) {
					if (this.rules[i].name === alias) {
						return this.rules[i];
					}
				}
			},

			/*
				Returns an array that is considered a NonTerminal.
				It is a collection of rules each built by the #buildRule function.
			*/
			nonTerminal: function(declarations) {
				var rules = [];
				for (var i = 0; i < declarations.length; i++) {
					rules.push(this.buildRule(declarations[i]));
				}
				return rules;
			},

			/*
				Builds a Repeat rule. Defaults min to 1 and max to Infinity. 
			*/
			repeat: function(name, rule, min, max, extension) {
				return {
					name: name,
					declaration: this.buildRule(rule),
					min: min || 1,
					max: max || 1.0 / 0,
					extension: extension,
					type: 'repeat'
				};
			},

			/*
				Main parsing function. If there are rules set for the Grammar
				then it will create a new input instance and create a Peggy.Match
				against it. Finally it will set result against the root of the Grammar
				and execute an extension if one is provided.
			*/
			parse: function(string) {
				if(!this.rules.root) {
					throw "No root rule specified. Please identify 1 rule as root.";
				}
				if (this.rules.count > 0) {
					var 
						// scanner for the string to parse
						input = new StringScanner(string),
						// root rule within this Grammar
						root = this.rules.root,
						// match object built against the root rule and the input
						match = new Peggy.Match(Peggy.engine.process(root, input)),
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
		Peggy.nonTerminals = "sequence choice".split(" ");

		/*
			Constructs a function for a NonTerminal API 
		*/
		var nonTerminalTypes = function(func) {
			return function() {
				var rules = this.nonTerminal(arguments);
				rules.type = func;
				return rules;
			};
		};

		// Iterate NonTerminal types and add them to the Peggy.prototype
		for (var i = 0; i < Peggy.nonTerminals.length; i++) {
			var func = Peggy.nonTerminals[i];
			Peggy.prototype[func] = nonTerminalTypes(func);
		}

		/*
			Peggy Rules engine. 
		*/
		Peggy.engine = (function() {

			/*
				Pass through to resolve alias type rules. Requires the
				rule to specify type. Delegates to the grammar instance alias
				resolver.
			*/
			var resolve = function(rule) {
				if (rule.type === 'alias') {
					var name = rule.declaration.substr(1);
					rule = rule.grammar.resolveAlias(rule.declaration);
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
			defaultTree = function(input, tree) {
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
			safeRegExp = function(declaration) {
				if (declaration.length === 1 && /\W/.test(declaration)) {
					return new RegExp('\\' + declaration);
				} else {
					return new RegExp(declaration);
				}
			},

			/* 
				Returns the tree parameter with the addition of 
				any matched content. This addition is a leaf to the tree.
			*/
			terminal = function(rule, input, tree) {
				var regex = (rule.type === 'stringTerminal') ? safeRegExp(rule.declaration) : rule.declaration,
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
			nonTerminal = function(rule, input, tree) {
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
						branch = process(rule.declaration[i], input, branch);
					}	
				} else if(rule.type === 'repeat') {
					do{	
						originalCount += branch.count;
						branch = process(rule.declaration, input, branch);
					} while(branch.count > originalCount);
				}

				// if there are matches we need to aggregate the 
				// strings from all sub-matches to the root match
				if(branch.count > 0){
					for(s = 0; s < branch.count; s++){
						branch.string += branch[s].string;
					}
				}

				if(rule.type === 'sequence'){
					if(branch.count > 0){
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

			process = function(rule, input, tree) {
				rule = resolve(rule);
				tree = defaultTree(input, tree);
				if (rule.isTerminal) {
					return terminal(rule, input, tree);
				} else {
					return nonTerminal(rule, input, tree);
				}
			};

			return {
				process: process
			};

		})();

		/*
			Constructor for matches against the rule tree. The tree is made up of rule nodes 
			and the matching strings they collected from scanning the input during
			Peggy.prototype.parse.
		*/
		Peggy.Match = function(tree) {
			if (typeof tree === 'undefined') throw 'Tree must be defined for Match';
			if (tree.count === 0) throw 'Failed to parse "' + tree.originalString + '"';
			this.tree = tree;
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
				this.captures = this.captures || {};
				var c;
				// if the match has a rule process it otherwise
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
					return (match.rule.extension)  ? match.rule.extension(match.string)  : match.string;
				} else {
				// NonTerminals are harder
					for (i = 0; i < match.count; i++) {
						// rule to process values against
						rule = match[i].rule;
						// if this match rule is Terminal - recurse for values
						if (rule.isTerminal) {
							value[i] = this.getValues(match[i]);
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
