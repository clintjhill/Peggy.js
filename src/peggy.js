(function(){
	var Peggy;
	((typeof exports !== "undefined" && exports !== null) ? exports : this).Peggy = (function() {
		
		Peggy = function(name){
			if(!name) {throw 'A grammar name is required';}
			this.name = name;
			this.rules = {count: 0};
			return this;
		};
		
		Peggy.version = "@VERSION";

		var jsTypes = "Boolean Number String Function Array Date RegExp Object".split(" ");

		Peggy.types = {};
		// Build the types collection based on JavaScript object definitions
		for(var t = 0; t < jsTypes.length; t++){
			Peggy.types["[object " + jsTypes[t] + "]"] = jsTypes[t].toLowerCase();
		}

		Peggy.type = function(declaration){
			return Peggy.types[Object.prototype.toString.call(declaration)];
		}

		Peggy.ruleType = function(declaration){
			var type = Peggy.type(declaration);
			if(type === 'regexp') return 'terminal';
			if(type === 'string') {
				if(declaration.charAt(0) === ':') return 'alias';
				return 'stringTerminal';
			}
			if(type === 'array') {
				return declaration.type;
			}
		};
		
		Peggy.prototype = {
			root: function(name, declaration, extension){
				var root = this.rule(name, declaration, extension);
				this.rules['root'] = root;
			},

			rule: function(name, declaration, extension){
				var rule = this.buildRule(declaration || name, extension);
				rule.name = name;
				this.rules[this.rules.count] = rule;
				this.rules.count += 1;
				return rule;
			},

			buildRule: function(declaration, extension){
				var type = Peggy.ruleType(declaration);
				var rule = {
					grammar: this,
					type: type,
					declaration: declaration,
					// extension is a function with a value param
					extension: extension,
					isTerminal: type === 'terminal' || type === 'stringTerminal'
				};
				return rule;
			},

			resolveRule: function(alias){
				for(var i = 0; i < this.rules.count; i++){
					// check against alias without leading ':'
					if(this.rules[i].name === alias.substr(1)){
						return this.rules[i];
					}
				}
			},

			nonTerminal: function(declarations){
				var rules = [];
				for(var i = 0; i < declarations.length; i++){
					rules.push(this.buildRule(declarations[i]));
				}
				return rules;
			},
			
			repeat: function(rule, min, max){
				var rules = this.nonTerminal([rule]);
				rules.type = 'repeat';
				rules.min = min;
				rules.max = max || 1.0/0;
				return rules;
			},

			parse: function(string){
				if(this.rules.count > 0){
					var input = new StringScanner(string);
					var root = this.rules['root'];
					var match = new Peggy.Match(Peggy.engine.process(root, input));
					var result = match.result();
					if(result[root.name]){
						return (root.extension) ? root.extension(result[root.name].value) : result[root.name].value;
					}
				}
			}
		};

		Peggy.nonTerminals = "sequence choice and or".split(" ");

		for(var nt in Peggy.nonTerminals){
			var func = Peggy.nonTerminals[nt];
			Peggy.prototype[func] = (function(func){
				return function(){
					var rules = this.nonTerminal(arguments);
					rules.type = func;
					return rules;
				}
			})(func);
		};
		
		Peggy.engine = (function(){

			var resolve = function(rule){
				if(rule.type === 'alias'){
					var name = rule.declaration.substr(1);
					rule = rule.grammar.resolveRule(rule.declaration);
					if(!rule) throw 'Failed to parse: ' + name + ' rule is not defined.';
					rule.name = name;
				}
				return rule;
			};

			var defaultTree = function(input, tree){
				// base tree model
				tree = tree || { count: 0, originalString: input.getSource() };
				return tree;
			};

			var safeRegExp = function(declaration){
				if(declaration.length === 1 && /\W/.test(declaration)){
					return new RegExp('\\' + declaration);
				} else {
					return new RegExp(declaration);
				}
			};

			var terminal = function(rule, input, tree){
				var regex = (rule.type === 'stringTerminal') ? 
					safeRegExp(rule.declaration) : 
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
				// when a branch has leaves/branches process them and add to tree
				if(subtree.count > 0) {
					var ruleType = rule.declaration.type, addToTree = false;
					if(ruleType === 'sequence'){
						addToTree = true;
					} else if(ruleType === 'and' && rule.declaration.length === subtree.count){
						addToTree = true;
					} else if((ruleType === 'choice' || ruleType === 'or') && subtree.count === 1){
						addToTree = true;
					} else if(ruleType === 'repeat' && rule.declaration.min <= subtree.count && rule.declaration.max >= subtree.count){
						addToTree = true;
					} else {
						throw 'Failed to parse: ' + rule.name + ' on "' + matched + '"';
					}
					if(addToTree){
						tree[tree.count] = subtree;
						tree.count += 1;
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
		
		Peggy.Match = function(tree){
			if(typeof tree === 'undefined') throw 'Tree must be defined for Match';
			if(tree.count === 0) throw 'Failed to parse "' + tree.originalString + '"';
			this.tree = tree;
			return this;
		};

		Peggy.Match.prototype = {
			capture: function(tree){
				if(!tree.count){
					this.processMatch(tree);
				} else {
					for(var m = 0; m < tree.count; m++){
						this.capture(tree[m]);
					}
					this.processMatch(tree);
				}
			},

			processMatch: function(match){
				this.captures = this.captures || {};
				var rule = match.rule;
				if(rule && rule.name){
					var c = { match: match.string, value: this.getValues(match) };
					this.safeCollect(this.captures, rule.name, c);
				}
			},

			getValues: function(match){
				if(!match.count && match.rule.extension){
					return match.rule.extension(match.string);
				} else {
					var value = {};
					for(var i = 0; i < match.count; i++){
						var rule = match[i].rule;
						var extended = (rule.extension) ? 
							rule.extension((rule.isTerminal) ?  match[i].string : this.getValues(match[i])) : 
							match[i].string;
						if(rule.isTerminal){
							value[i] = extended;
						} else {
							this.safeCollect(value, rule.name || i, extended);	
						}
					}
					return value;
				}
			},

			safeCollect: function(collector, key, value){
				if(collector[key]){
					if(Peggy.types[toString.call(collector[key])] !== 'array'){
						collector[key] = [collector[key]];
						collector[key].push(value);
					}
				} else {
					collector[key] = value;
				}
			},

			result: function(){
				this.capture(this.tree);
				return this.captures;
			}
		};

		return Peggy;
	})();
})();