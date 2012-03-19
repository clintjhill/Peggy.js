/*
demo = {
	additive: (:number, :plus, :number){
		return value['number'][0] + value['number'][2];
	},
	number: (:digit, :space){
		return value.digit;
	},
	plus: ('+', :space),
	digit: (/\d+/, :space){
		return new Number(value[0]);
	},
	space: /\s+/
}
*/
var peggy, grammar;

/* Global for Peggy Grammar Syntax */
Peggy.Grammar = peggy = new Peggy('grammar');

/* Root of Peggy Syntax */
peggy.root('grammar', peggy.sequence(':name', ':open', peggy.repeat('rules',':rule'), ':close'), function(value) {
	// 'this' is equal to the rule 'grammar'; 
	// TODO: maybe it is possible to extend 'rule' to provide useable public API
	grammar = window[value.name] = new Peggy(value.name);
	for(var i = 0; i < value.rules.rule.length; i++){
		var r = value.rules.rule[i];
		grammar.rule(r.name, r.expression);
	}
	return value;
});

/* Peggy Rule rule */
peggy.rule('rule', peggy.sequence(':ruleName', ':expression', ':comma'), function(value) {
	return {
		name: value.ruleName,
		expression: value.expression
		//block: value.block
	};
});

/* Rule name, simple regex for word followed by space(s) */
peggy.rule('ruleName', peggy.sequence(/\w+\:/, ':space'), function(value) {
	return value[0].replace(':', '');
});

/* Rule expression - not the function block */
peggy.rule('expression', peggy.choice(':nonTerminal', ':terminal'), function(value) {
	return value[0];
});

peggy.rule('nonTerminal', peggy.sequence('(', ':list', ')'), function(value) {
	return value;
});

peggy.rule('list', peggy.repeat(':aliases', ':alias', 2), function(value) {
	return value;
});

peggy.rule('alias', /\:\w+\,?/, function(value) {
	return value.substr(1);
});

peggy.rule('block', peggy.sequence(':open', ':script', ':close'), function(value) {
	return value[1];
});

peggy.rule('script', /\w+/, function(value) {
	return value;
});

peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value) {
	return value[0];
});

//peggy.rule('terminal', peggy.choice(/(\/.*\/)/, /[a-zA-Z]+/), function(value) {
peggy.rule('terminal', /(\/\w+[^,]\/)/, function(value) {
	return value;
});

peggy.rule('open', peggy.sequence('{', ':space'), function(value) {
	return value[0];
});

peggy.rule('close', peggy.sequence(':space', '}'), function(value) {
	return value[1] || value[0];
});

peggy.rule('equal', peggy.sequence(':space', '=', ':space'), function(value) {
	return value[1] || value[0];
});

peggy.rule('comma', peggy.sequence(':space', ',', ':space'), function(value){
	return value;
});

peggy.rule('space', /\s+/, function(value) {
	return value;
});

