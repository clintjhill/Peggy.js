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

/* Global for Peggy Grammar Syntax */
Peggy.Grammar = peggy = new Peggy('grammar');

/* Root of Peggy Syntax */
peggy.root('grammar', peggy.sequence(':name', ':open', peggy.repeat('rules',':rule'), ':close'), function(value) {
	// 'this' is equal to the rule 'grammar'; 
	// maybe it is possible to extend 'rule' to provide useable public API
	console.log('[grammar.js] grammar', value);
	window[value.name] = new Peggy(value.name);
	return value;
});

/* Peggy Rule rule */
peggy.rule('rule', peggy.sequence(':ruleName', ':expression'), function(value) {
	console.log('[grammar.js] rule', value);
	return {
		name: value.ruleName,
		expression: value.expression
		//block: value.block
	};
});

/* Rule name, simple regex for word followed by space(s) */
peggy.rule('ruleName', peggy.sequence(/\w+\:/, ':space'), function(value) {
	console.log('[grammar.js] ruleName', value);
	return value[0].replace(':', '');
});

/* Rule expression - not the function block */
peggy.rule('expression', peggy.choice(':nonTerminal', ':terminal'), function(value) {
	console.log('[grammar.js] expression', value);
	return value[0];
});

peggy.rule('nonTerminal', peggy.sequence('(', ':list', ')'), function(value) {
	console.log('[grammar.js] nonTerminal', value);
});

peggy.rule('list', peggy.repeat(':aliases', ':alias', 2), function(value) {
	console.log('[grammar.js] list', value);
	return value;
});

peggy.rule('alias', /\:\w+\,?/, function(value) {
	console.log('[grammar.js] alias', value);
	return value.substr(1);
});

peggy.rule('block', peggy.sequence(':open', ':script', ':close'), function(value) {
	console.log('[grammar.js] block', value);
	return value[1];
});

peggy.rule('script', /\w+/, function(value) {
	console.log('[grammar.js] script', value);
});

peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value) {
	console.log('[grammar.js] name', value);
	return value[0];
});

peggy.rule('terminal', /(\/.*\/)|.*/, function(value) {
	console.log('[grammar.js] terminal', value);
	return value;
});

peggy.rule('open', peggy.sequence('{', ':space'), function(value) {
	console.log('[grammar.js] open', value);
	return value[0];
});

peggy.rule('close', peggy.sequence(':space', '}'), function(value) {
	console.log('[grammar.js] close', value);
	return value[1] || value[0];
});

peggy.rule('equal', peggy.sequence(':space', '=', ':space'), function(value) {
	console.log('[grammar.js] equal', value);
	return value[1] || value[0];
});

peggy.rule('space', /\s+/, function(value) {
	console.log('[grammar.js] space', value);
	return value;
});

