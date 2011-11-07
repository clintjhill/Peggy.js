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
peggy.rule('grammar', peggy.sequence(':name', ':open', peggy.repeat(':rule', 1), ':close'), function(value){ return value; });
peggy.rule('rule', 'some', function(value){ return value; });
peggy.rule('name', peggy.sequence(/\w+/, ':equal'), function(value){ console.log('name', value); return value[0]; });
peggy.rule('open', peggy.sequence('{', ':space'));
peggy.rule('close', peggy.sequence(':space', '}'));
peggy.rule('equal', peggy.sequence(':space', '=', ':space'));
peggy.rule('space', /\s+/);
