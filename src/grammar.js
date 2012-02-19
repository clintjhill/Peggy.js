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
/* Set Globals for Peggy Grammar Syntax */
Peggy.Grammar = peggy = new Peggy('grammar');

/* Root of Peggy Syntax */
peggy.root('grammar', peggy.sequence(':name', ':open', peggy.repeat(':rule', 1), ':close'), function(value){
	// this is equal to the rule 'grammar'; 
	// maybe it is possible to extend 'rule' to provide useable public API
	console.log('grammar', value.name, value);
	window[value.name] = new Peggy(value.name);
});

/* Peggy Rule rule */
peggy.rule('rule', peggy.sequence(':ruleName', ':expression',':block'), function(value){ 
	console.log('rule', value);
	return { name: value.ruleName, expression: value.expression, block: value.block }; 
});

/* Rule name, simple regex for word followed by space(s) */
peggy.rule('ruleName', peggy.sequence(/\w+\:/, ':space'), function(value){ 
	console.log('ruleName', value);
	return value[0]; 
});

/* Rule expression - not the function block */
peggy.rule('expression', /* declaration term*/ peggy.choice(':nonTerminal', ':terminal'), function(value){
	console.log('expression', value);
	return value;
});

peggy.rule('nonTerminal', peggy.sequence('(',':list',')'), function(value){
	console.log('nonTerminal', value);
});

peggy.rule('list', peggy.repeat(':alias', 2), function(value){ 
	console.log('list', value);
	return value; 
});

peggy.rule('alias', /\:\w+\,?/, function(value){ 
	console.log('alias', value);
	return value.substr(1); 
});

peggy.rule('terminal', /\w+/, function(value){
	console.log('terminal', value);
});

peggy.rule('block', peggy.sequence(':open', ':script', ':close'), function(value){ 
	console.log('block', value);
	return value[1]; 
});

peggy.rule('script', /\w+/, function(value){
	console.log('script', value);
});

peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value){ return value[0]; });
peggy.rule('open', peggy.sequence('{', ':space'));
peggy.rule('close', peggy.sequence(':space', '}'));
peggy.rule('equal', peggy.sequence(':space', '=', ':space'));
peggy.rule('space', /\s+/);
