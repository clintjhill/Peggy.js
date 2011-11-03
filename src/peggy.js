var toString = Object.prototype.toString;

var Peggy = function(name){
	this.name = name;
	this.rules = {count: 0};
	return this;
};

Peggy.version = "@VERSION";

// Collection of JavaScript types (thanks jQuery)
var jsTypes = "Boolean Number String Function Array Date RegExp Object".split(" ");

Peggy.types = {};
// Build the types collection based on JavaScript object definitions
for(var t = 0; t < jsTypes.length; t++){
	Peggy.types["[object " + jsTypes[t] + "]"] = jsTypes[t].toLowerCase();
}

Peggy.ruleType = function(declaration){
	var type = Peggy.types[toString.call(declaration)];
	if(type === 'regexp') return 'terminal';
	if(type === 'string') {
		//TODO: Make clear decision about alias flagging !
		if(declaration.charAt(0) === ':') return 'alias';
		return 'stringTerminal';
	}
	if(type === 'array') {
		if(declaration.type === 'sequence') return 'sequence';
		if(declaration.type === 'choice') return 'choice';
	}
};

Peggy.prototype.rule = function(name, declaration, extension){
	var rule = this.buildRule(declaration || name, extension);
	rule.name = name;
	this.rules[this.rules.count] = rule;
	this.rules.count += 1;
	return rule;
};

Peggy.prototype.buildRule = function(declaration, extension){
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
};

Peggy.prototype.resolveRule = function(alias){
	for(var i = 0; i < this.rules.count; i++){
		// check against alias without leading ':'
		if(this.rules[i].name === alias.substr(1)){
			return this.rules[i];
		}
	}
};

Peggy.prototype.nonTerminal = function(declarations){
	var rules = [];
	for(var i = 0; i < declarations.length; i++){
		rules.push(this.buildRule(declarations[i]));
	}
	return rules;
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

Peggy.prototype.repeat = function(rule, min, max){
	var rules = this.nonTerminal([rule]);
	rules.type = 'repeat';
	rules.min = min;
	rules.max = max || 1.0/0;
	return rules;
};

Peggy.prototype.parse = function(string){
	if(this.rules.count > 0){
		var input = new StringScanner(string);
		//TODO: Way to declare root in rule declarations
		var root = this.rules[0]
		var match = new Match(Peggy.engine.process(root, input));
		var result = match.result();
		if(result[root.name]){
			return result[root.name].value;
		}
	}
};
