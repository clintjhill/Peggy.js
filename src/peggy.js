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
			this.resolve = function(ruleName) {
				return Peggy.resolveAlias(this, ruleName);
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
			Rule model. There are essentially 2 types of rules: terminal and non-temrinal.
			Terminal rules will simply be a declaration (like regexp). Non-terminal rules are 
			arrays of rules (both terminal and non-terminal). These non-terminal rule types
			will be denoted by a 'type' property on the declaration.
		*/
		Peggy.ruleType = function(declaration) {
			var type = Peggy.type(declaration);
			if (type === 'regexp') return 'terminal';
			if (type === 'string') {
				if (declaration.charAt(0) === ':' && declaration.length > 1) return 'alias';
				return 'stringTerminal';
			}
			// This is where choice, sequence, any, not, and, repeat come from
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
			This does not add anything to the grammar rather is a constructor
			for a rule.
		*/
		Peggy.buildRule = function(grammar, declaration, extension, execute) {
			// if this declaration is already a rule don't rebuild it but override ext and exec
			if(Peggy.isRule(declaration)) {
				if(extension) declaration.extension = extension;
				if(execute) declaration.execute = execute;
				return declaration;
			}
				
			// determine the type of rule we'll build based on kind of declaration
			var type = Peggy.ruleType(declaration);
			return {
				grammar: grammar,
				type: type,
				declaration: declaration,
				isTerminal: type === 'terminal' || type === 'stringTerminal',
				/*
					this is a function that will be called to evaluate the value found
					from a parse.
				*/
				extension: extension,
				/* 
					This allows for rules to be created with a standard 'execution'
					function or be provided with a special function.
				*/
				execute: execute || Peggy.Executions[type],
				/*
					A special bucket for the rule to keep info in. Useable 
					during the parsing/matching process.
				*/
				scope: {}
			};
		};

		// Quick list of Peggy Rule types (not the same as Peggy types)
		var ruleTypes = "sequence choice any repeat and not".split(" ");

		/*
			Returns true if declaration has a type and it matches one of
			the Peggy rule types. False otherwise.
		*/
		Peggy.isRule = function(declaration){
			if(!declaration.type) return false;
			var l = ruleTypes.length;
			while(l--){
				if(ruleTypes[l] === declaration.type) return true;
			}
			return false;
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
		
		return Peggy;
	})();
})();