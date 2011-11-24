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
Peggy.Grammar = peggy = new Peggy('grammar');
peggy.root('grammar', peggy.sequence(':name', ':open', peggy.repeat(':rule', 1), ':close'), function(value){
	// this is equal to the rule 'grammar'; 
	// maybe it is possible to extend 'rule' to provide useable public API
	console.log('grammar', value);
	window[value['name']] = new Peggy(value['name']);
});
peggy.rule('rule', peggy.sequence(':ruleName', ':expression',':block'), function(value){ return value; });
peggy.rule('ruleName', peggy.sequence(/\w+\:/, ':space'), function(value){ return value[0]; });
peggy.rule('expression', /* declaration term*/ peggy.choice(':nonTerminal', ':terminal'));
peggy.rule('nonTerminal', peggy.sequence('(',':list',')'));
peggy.rule('list', peggy.repeat(':alias', 2), function(value){ return value; });
peggy.rule('alias', /\:\w+\,?/, function(value){ return value.substr(1); });
peggy.rule('terminal', /\w+/);
peggy.rule('block', peggy.sequence(':open', ':script', ':close'), function(value){ return value[1]; });
peggy.rule('script', /\w+/);
peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value){ return value[0]; });
peggy.rule('open', peggy.sequence('{', ':space'));
peggy.rule('close', peggy.sequence(':space', '}'));
peggy.rule('equal', peggy.sequence(':space', '=', ':space'));
peggy.rule('space', /\s+/);
