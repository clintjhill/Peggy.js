var css = new Peggy("CSS");

css.root("sheet", css.any(css.repeat("rules", ":rule"), css.repeat("media", ":media")), 
	function(value){
		if(!this.rules) this.rules = [];
		if(!this.media) this.media = [];
		if(value.rules){
			this.rules = this.rules.concat(value.rules);
		}
		if(value.media){
			this.media = this.media.concat(value.media);
		}
		return this;
	}, 
	function(value){
		return { rules: this.rules, media: this.media };
	}, true);

// MEDIA
css.rule("media", css.sequence(/@media/, css.zeroOrMore(":ws"), ":ruleName", ":open", css.repeat("rules", ":rule"), ":close"), function(value){
	return {types: value.ruleName, rules: value.rules};
});

// RULES
css.rule("rule", css.sequence(":ruleName", ":open", ":ruleBody", ":close"), function(value){
	return {selector: value.ruleName, properties: value.ruleBody};
});

css.rule("ruleName", css.any(/\w+/, ":ws"), function(value) {
	console.log('ruleName', value);
	return value[0]; 
});

css.rule("ruleBody", css.repeat("properties", ":property"), function(value) { 
	return value.property; 
});

// PROPERTIES
css.rule("property", css.sequence(":propertyName", ":propertyValue"), function(value){
	console.log('property', value);
	var name = value.propertyName,
		val = value.propertyValue,
		result = {};
	result[name] = val;
	return result; 
});

css.rule("propertyName", css.sequence(/\w+/, ":", ":ws"), function(value){
	console.log('propertyName', value);
	return value[0];
});

css.rule("propertyValue", css.sequence(/\w+/, ";"), function(value){
	console.log('propertyValue', value);
	return value[0];
});

css.rule("comment", css.sequence(/\/*/, /[^*\/]/, "*/"));

css.rule("open", css.any(/\{/, ":ws"), function(value) { console.log('open', value); });
css.rule("close", css.any(":ws", /\}/, ":ws"), function(value) { console.log('close', value); });
css.rule("ws", /\s*/);