(function(){

/*
  Whitespace builtin: /^(?:[\t\n\r ]+|[\t\n\r ]*((\/\/.*|\/\*(.|\n|\r)*?\*\/)[\t\n\r ]*))+/
*/
  /*
    Symbols for the types of rules that can be created with Peggy.
  */
  var sequence = "..",
    choice = "||",
    zeroOrMore = "*",
    oneOrMore = "+",
    and = "&",
    not = "!",
    optional = "?",
    terminal = ".";

  /*
    Collection of the types of rules for use in rule detection.
  */
  var ruleFlags = [choice, zeroOrMore, oneOrMore, and, not, optional];

  /*
    Predicate to determine that an Object is a Rule.
    Requires a 'name', 'type' and 'decl' property on
    an Object in order to be a Rule.
  */
  var isRule = function(rule){
    return !_.isString(rule) &&
      !_.isArray(rule) &&
      _.isObject(rule) &&
      _.has(rule, 'name') &&
      _.has(rule, 'type') &&
      _.has(rule, 'decl');
  };

  var isSequence = function(rule){
    return _.isArray(rule) && !_.contains(ruleFlags, _.first(rule));
  };

  var isChoice = function(rule){
    return _.isArray(rule) && _.first(rule) === choice;
  };

  var isOneOrMore = function(rule){
    return _.isArray(rule) && _.first(rule) === oneOrMore;
  };

  var isZeroOrMore = function(rule){
    return _.isArray(rule) && _.first(rule) === zeroOrMore;
  };

  var isNot = function(rule){
    return _.isArray(rule) && _.first(rule) === not;
  };

  var isOptional = function(rule){
    return _.isArray(rule) && _.first(rule) === optional;
  };

  var isTerminal = function(rule){
    return _.isRegExp(rule) || _.isString(rule);
  };

  /*
    Determines the type of Rule and returns the respective symbol.
  */
  var getType = function(decl){
    if(isSequence(decl)) return sequence;
    if(isChoice(decl)) return choice;
    if(isOneOrMore(decl)) return oneOrMore;
    if(isZeroOrMore(decl)) return zeroOrMore;
    if(isTerminal(decl)) return terminal;
    if(isNot(decl)) return not;
    if(isOptional(decl)) return optional;
  };

  /*
    Constructor to build a Peggy grammar.
  */
  var Peggy = function(def, ext){
    var rule = {};
    this.exts = ext || {};
    this.rules = [];
    _.each(def, function(decl, key){
      rule = {
        name: key.toString(),
        decl: decl,
        type: getType(decl)
      };
      // non-terminal types of rules (one-or-more, zero-or-more, not)
      if(rule.type !== sequence && rule.type !== choice && rule.type !== terminal){
        rule.decl = rule.decl[1];
      // choice types have potentially many rules so we need the tail of the array
      } else if(rule.type === choice) {
        rule.decl = rule.decl.slice(1);
      }
      this.rules.push(rule);
    }, this);
  };

  Peggy.version = "<%= pkg.version %>";

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Peggy;
    }
    exports.Peggy = Peggy;
  } else {
    this.Peggy = Peggy;
  }

  Peggy.prototype = {
    parse: function(val){
      // the string value to scan for matches
      this.input = new Peggy.StringScanner(val);
      // the match tree built from scanner
      this.tree = {};
      // alias for tree 
      this.ast = this.tree;
      // ID tracker for match events (increments on every match) and
      // also used as a way to sync on oneOrMore & zeroOrMore rules.
      // Specifically this is the number of Terminal events.
      this.eventId = 0;
      // the portion of input that succeeded matching
      this.parsed = function(){
        return this.input.getScanned();
      };
      this.failed = function(){
        return this.input.getRemainder();
      };
      // peform the scan and find matches
      var result = execute.call(this, this.root(), this.tree);
      if(result){
        return result;
      } else {
        this.tree = null;
        return false;
      }
    },

    root: function(){
      return this.rules[0];
    },
    
    /*
      Resolves rules by name.
    */
    resolve: function(rule){
      return _.find(this.rules, function(r){
        return r.name === rule;
      });
    }
  };

  /*
    Every single rule will be executed through this function.
    Initial call sends "parse" instance tree, not interstitial tree.
  */
  var execute = function(rule, tree){
    if(!isRule(rule)) {
      rule = this.resolve(rule);
    }
    return executions[rule.type].call(this, rule, tree);
  };

  /*
    A helper function to process non-terminal rules and provide
    a way to determine minimum iteration count.
  */
  var nonTerminal = function(r, t, minimum, maximum){
    var rule = this.resolve(r.decl),
        result = {}, 
        count = 0, 
        interim = {}, 
        winning = true;
    result[rule.name] = [];
    while(winning){
      interim = execute.call(this, rule, {});
      if(interim){
        // if there is an extension send this result and the rule
        if(this.exts[rule.name]){
          interim = this.exts[rule.name](interim, rule);
        }
        result[rule.name].push(interim[rule.name] || interim);
        count++;
        if(maximum && count === maximum){
          winning = false;
        }
      } else {
        winning = false;
      }
    }
    if(count >= minimum){
      t[r.name] = result;
      return t;
    } else {
      return false;
    }
  };

  /*
    Safely folds a value into an optionally provided object (folded),
    allowing the object to change type (array) to become a collection.
  */
  var foldInto = function(folded, interim, rule){
    var value = interim[rule.name] || interim;
    // if passed an object to fold into and it's not array
    // make it an array and push value into it.
    if(folded && !_.isArray(folded)){
      folded = [folded];
      folded.push(value);
    // if passed an object that is an array push value into it.
    } else if(_.isArray(folded)){
      folded.push(value);
    // if not passed an object then create it with the value provided.
    } else {
      folded = value;
    }
    return folded;
  };

  /*
    Executions are the logic for each Rule type. They are identified by
    the Rule Symbol and return boolean to determine success.

    Each execution requires the Rule and the current Tree.
  */
  var executions = {};

  // choice 
  executions[choice] = function(r, t){
    var interim = {}, passed = false;
    for(var s = 0; s < r.decl.length; s++){
      var rule = this.resolve(r.decl[s]);
      interim = execute.call(this, rule, {});
      if(interim){
        // if there is an extension send this result and the rule
        if(this.exts[rule.name]){
          interim = this.exts[rule.name](interim, rule);
        }
        t[r.name] = interim[rule.name] || interim;
        passed = true;
        break;
      }
    }
    return (passed) ? t : false;
  };

  // sequence
  executions[sequence] = function(r, t){
    var interim = {}, count = 0, result = {};
    for(var s = 0; s < r.decl.length; s++){
      var rule = this.resolve(r.decl[s]);
      interim = execute.call(this, rule, {});
      if(interim){
        result[rule.name] = foldInto.call(this, result[rule.name], interim, rule);
        count++;
      }
    }
    if(count === r.decl.length){
      if(this.exts[r.name]){
        result = this.exts[r.name](result, r);
      }
      t[r.name] = result;
      return t;
    } else {
      return false;
    }
  };

  // oneOrMore
  executions[oneOrMore] = function(r, t){
    return nonTerminal.call(this, r, t, 1);
  };

  // zeroOrMore
  executions[zeroOrMore] = function(r, t){
    return nonTerminal.call(this, r, t, 0);
  };

  // optional
  executions[optional] = function(r, t){
    return nonTerminal.call(this, r, t, 0, 1);
  };

  // not
  executions[not] = function(r, t){
    if(!execute.call(this, this.resolve(r.decl))){
      ++this.eventId;
      return true;
    } else {
      return false;
    }
  };

  // terminal
  executions[terminal] = function(r, t){
    if(!_.isRegExp(r.decl)){
      r.decl = new RegExp(r.decl);
    }
    var match = this.input.scan(r.decl);
    if(!match) return false;
    ++this.eventId;
    // if there is an extension send this result and the rule
    if(this.exts[r.name]){
      match = this.exts[r.name](match, r);
    }
    t[r.name] = foldInto.call(this, t[r.name], match, r);
    return t;
  };

}).call(this);
