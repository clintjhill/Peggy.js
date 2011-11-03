Peggy.Grammar = peggy = new Peggy('grammar');

peggy.rule('grammar', peggy.sequence(':name', ':open', peggy.repeat(':rule', 1), ':close'), function(value){
	return value;
});



