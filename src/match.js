/*
	Constructor for matches against the rule tree. The tree is made up of rule nodes 
	and the matching strings they collected from scanning the input during
	Peggy.prototype.parse.
*/
Peggy.Match = function(tree, instrument) {
	if (typeof tree === 'undefined') throw 'Tree must be defined for Match to capture against.';
	this.tree = tree;
	this.instrument = instrument;
	return this;
};

/*
	Prototype for Peggy.Match instances. 
*/
Peggy.Match.prototype = {

	// Helper to index the captures and prevent duplication of names
	captureId: 0,

	/*
		Returns the value of provided tree. Performs checks against 
		the tree Rule to properly calculate value against Terminal types
		or whether there is an extension to perform against the match.
	*/
	getValues: function(tree) {
		var 
			// interim object used to store trees
			value,
			// return object (used only in NonTerminal values)
			values = {}, 
			// iterator for matches
			i,
			// rule placeholder in matches loop
			rule,
			valueName,
			valueExtended;

		// Terminals are easy - return the extended value
		if (tree.rule && tree.rule.isTerminal) {
			return this.extendValue(tree.rule, tree.match);
		} else {
		// NonTerminals are harder
			for (i = 0; i < tree.count; i++) {
				// rule to process values against
				rule = tree[i].rule;
				// if this tree rule is Terminal - recurse for values
				if (rule.isTerminal) {
					values[rule.name || i] = this.getValues(tree[i]);
				} else {
					valueName = rule.name || this.captureId++;
					value = this.getValues(tree[i]);
					valueExtended = this.extendValue(rule, value);
					this.safeCollect(values, valueName, valueExtended);
				}
			}
			return values;
		}
	},

	extendValue: function(rule, value){
		return (rule.extension) ? rule.extension(value) : value;
	},

	/*
		Helper function to add an object to another object while preventing
		overwrites. If key exists it will safely create an array for the key so all
		values are preserved.
	*/
	safeCollect: function(collector, key, value) {
		if (collector[key]) {
			if (Peggy.types[toString.call(collector[key])] !== 'array') {
				collector[key] = [collector[key]];						
			}
			collector[key].push(value);
		} else {
			collector[key] = value;
		}
	},

	/*
		Returns the captured values as a heirarchal node list based on the
		structure of the Grammar.
	*/
	result: function() {
		return this.getValues(this.tree);
	}
};