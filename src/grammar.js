/*
demo = {
	additive: (:number, :plus, :number) {{
		return value['number'][0] + value['number'][2];
	}},
	number: (:digit, :space) {{
		return value.digit;
	}},
	plus: ('+', :space),
	digit: (/\d+/, :space) {{
		return new Number(value[0]);
	}},
	space: /\s+/
}
*/
var peggy, grammar;

/* Global for Peggy Grammar Syntax */
Peggy.Grammar = peggy = new Peggy('grammar');

/* Root of Peggy Syntax */
peggy.root('grammar', peggy.all(':name', ':open', peggy.zeroOrMore('rules',':rule'), ':close'), function(value) {
	console.log('[Peggy.grammar]', value);
	// 'this' is equal to the rule 'grammar'; 
	// TODO: maybe it is possible to extend 'rule' to provide useable public API
	grammar = window[value.name] = new Peggy(value.name);
		for(var i = 0; i < value.rules.rule.length; i++){
			var r = value.rules.rule[i];
			grammar.rule(r.name, r.expression, r.block);
		}
	return grammar;
});

/* Peggy Rule rule */
peggy.rule('rule', peggy.all(':ruleName', ':expression', ':block'), function(value) {
	return {
		name: value.ruleName,
		expression: value.expression,
		block: value.block
	};
});

/* Rule name, simple regex for word followed by space(s) */
peggy.rule('ruleName', peggy.sequence(/\w+\:/, ':space'), function(value) {
	return value[0].replace(':', '');
});

/* Rule expression - not the function block */
peggy.rule('expression', peggy.choice(':nonTerminal', ':terminal'), function(value) {
	return value.terminal || value.nonTerminal;
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

peggy.rule('block', peggy.sequence(':scriptOpen', ':script', ':scriptClose', ':comma'), function(value) {
	return new Function("value", value.script);
});

peggy.rule('script', /[^\}\}]+/, function(value) {
	return value;
});

peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value) {
	return value[0];
});

peggy.rule('terminal', /(\/[\w\\]+[^,]\/)/, function(value) {
	return value;
});

peggy.rule('open', peggy.sequence(':space', '{', ':space'), function(value) {
	return value[1] || value[0];
});

peggy.rule('scriptOpen', peggy.sequence(':space', '{','{', ':space'), function(value){
	return value;
});

peggy.rule('scriptClose', peggy.sequence(':space', /}}/, ':space'), function(value){
	return value;
});

peggy.rule('close', peggy.sequence(':space', '}', ':space'), function(value) {
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

