var css = new Peggy("CSS"), instrument = true;
css.root("sheet", css.repeat(":rule"), function(value){
	console.log('css#sheet', value);
	return value; 
}, instrument);

css.rule("rule", css.sequence(":ruleName", ":ruleStart", ":ruleBody", ":ruleEnd"), function(value){
	console.log('css#rule', value);
	return {name: value.ruleName, body: value.ruleBody};
}, instrument);

css.rule("ruleName", /\w+/, function(value) {
	console.log('css#ruleName', value); 
	return value; 
}, instrument);

css.rule("ruleStart", /\{/, function(value){
	console.log('css#ruleStart');
}, instrument);

css.rule("ruleBody", css.repeat(":property"), function(value) { 
	console.log('css#ruleBody');
	return value; 
}, instrument);

css.rule("ruleEnd", css.sequence(/\}/, /\s+/), function(value){
	console.log('css#ruleEnd');
}, instrument);

css.rule("property", css.sequence(":propertyName", ":propertyAssignment", ":propertyValue"), function(value){
	console.log('css#property', value.propertyName, value.propertyValue);
	return {name: value.propertyName, value: value.propertyValue}; 
}, instrument);

css.rule("propertyName", css.sequence(/\s+/, /\w+/), function(value){
	console.log('css#propertyName', value[1]);
	return value[1];
}, instrument);

css.rule("propertyAssignment", css.sequence(/:/, /\s+/), function(value){
	console.log('css#propertyAssignment', value[0]);
}, instrument);

css.rule("propertyValue", css.sequence(/\w+/, /;\s+/), function(value){
	console.log('css#propertyValue', value[0]);
	return value[0];
}, instrument);