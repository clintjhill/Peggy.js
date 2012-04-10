(function(){var a;(typeof exports!="undefined"&&exports!==null?exports:this).Peggy=function(){a=function(a){if(!a)throw"A grammar name is required";this.name=a,this.rules={count:0};return this},a.version="0.9.0";var b="Boolean Number String Function Array Date RegExp Object".split(" ");a.types={};for(var c=0;c<b.length;c++)a.types["[object "+b[c]+"]"]=b[c].toLowerCase();a.type=function(b){return a.types[Object.prototype.toString.call(b)]},a.ruleType=function(b){var c=a.type(b);if(c==="regexp")return"terminal";if(c==="string"){if(b.charAt(0)===":")return"alias";return"stringTerminal"}if(c==="array")return b.type;if(c==="object")return"rule"},a.buildRule=function(b,c,d){var e=a.ruleType(c);if(e==="rule")return c;return{grammar:b,type:e,declaration:c,extension:d,isTerminal:e==="terminal"||e==="stringTerminal"}},a.resolveAlias=function(a,b){b=b.charAt(0)===":"?b.substr(1):b;for(var c=0;c<a.rules.count;c++)if(a.rules[c].name===b)return a.rules[c]},a.prototype={root:function(a,b,c){var d=this.rule(a,b,c);this.rules.root=d},rule:function(b,c,d,e,f){var g=a.buildRule(this,c||b,d);g.name=b,g.debugEngine=e,g.debugMatch=f,this.rules[this.rules.count]=g,this.rules.count+=1;return g},nonTerminal:function(b){var c=[];for(var d=0;d<b.length;d++)c.push(a.buildRule(this,b[d]));return c},repeat:function(b,c,d,e,f){return{name:b,declaration:a.buildRule(this,c),min:d||1,max:e||1/0,extension:f,type:"repeat"}},oneOrMore:function(a,b,c){return this.repeat(a,b,null,null,c)},zeroOrMore:function(a,b,c){return this.repeat(a,b,0,null,c)},zeroOrOne:function(a,b,c){return this.repeat(a,b,0,1,c)},parse:function(b){if(this.rules.count>0){var c=new a.StringScanner(b),d=this.rules.root||this.rules[0],e=new a.Match(a.Engine.process(d,c)),f=e.result();if(f[d.name])return d.extension?d.extension(f[d.name].value):f[d.name].value}}},a.nonTerminals="sequence choice any all".split(" ");var d=function(a){return function(){var b=this.nonTerminal(arguments);b.type=a;return b}};for(var e=0;e<a.nonTerminals.length;e++){var f=a.nonTerminals[e];a.prototype[f]=d(f)}a.StringScanner=function(a){this.source=a+"",this.reset();return this},a.StringScanner.prototype.scan=function(a){var b=a.exec(this.getRemainder());return b&&b.index===0?this.setState(b,{head:this.head+b[0].length,last:this.head}):this.setState([])},a.StringScanner.prototype.getRemainder=function(){return this.source.slice(this.head)},a.StringScanner.prototype.setState=function(a,b){var c,d;this.head=typeof (c=typeof b=="undefined"||b===null?undefined:b.head)!="undefined"&&c!==null?c:this.head,this.last=typeof (d=typeof b=="undefined"||b===null?undefined:b.last)!="undefined"&&d!==null?d:this.last,this.captures=a.slice(1);return this.match=a[0]},a.StringScanner.prototype.getSource=function(){return this.source},a.StringScanner.prototype.reset=function(){return this.setState([],{head:0,last:0})},a.Engine={resolve:function(b){if(b.type==="alias"){var c=b.declaration.substr(1);b=a.resolveAlias(b.grammar,b.declaration);if(!b)throw"Failed to parse: "+c+" rule is not defined.";b.name=c}return b},defaultTree:function(a,b){return b||{count:0,originalString:a.getSource()}},safeRegExp:function(a){return a.length===1&&/\W/.test(a)?new RegExp("\\"+a):a.charAt(0)==="/"&&a.charAt(a.length-1)==="/"?new RegExp(a.substring(1,a.length-1)):new RegExp(a)},terminal:function(a,b,c){var d=a.type==="stringTerminal"?this.safeRegExp(a.declaration):a.declaration,e=b.scan(d);e&&(c[c.count]={rule:a,string:e},c.count+=1);return c},nonTerminal:function(b,c,d){var e={rule:b,count:0,string:""},f=0,g,h,i=function(a){d[d.count]=a,d.count+=1};if(a.type(b.declaration)==="array")for(g=0;g<b.declaration.length;g++)e=this.process(b.declaration[g],c,e);else if(b.type==="repeat")do f+=e.count,e=this.process(b.declaration,c,e);while(e.count>f);if(e.count>0)for(h=0;h<e.count;h++)e.string+=e[h].string;b.type==="sequence"||b.type==="any"?e.count>0&&i(e):b.type==="all"?e.count===b.declaration.length&&i(e):b.type==="choice"?e.count===1&&i(e):b.type==="repeat"&&e.count>=b.min&&e.count<=b.max&&i(e);return d},process:function(a,b,c){a=this.resolve(a),c=this.defaultTree(b,c);return a.isTerminal?this.terminal(a,b,c):this.nonTerminal(a,b,c)}},a.Match=function(a){if(typeof a=="undefined")throw"Tree must be defined for Match";if(a.count===0)throw'Failed to parse "'+a.originalString+'"';this.tree=a,this.captures={};return this},a.Match.prototype={capture:function(a){var b;if(!a.count)this.processMatch(a);else{for(b=0;b<a.count;b++)this.capture(a[b]);this.processMatch(a)}},captureId:0,processMatch:function(a){var b;a.rule&&(b={match:a.string,value:this.getValues(a)},this.safeCollect(this.captures,a.rule.name||this.captureId,b),this.captureId+=1)},getValues:function(a){var b={},c,d;if(a.rule.isTerminal)return a.rule.extension?a.rule.extension(a.string):a.string;for(c=0;c<a.count;c++)d=a[c].rule,d.isTerminal?b[d.name||c]=this.getValues(a[c]):(this.safeCollect(b,d.name||this.captureId,d.extension?d.extension(this.getValues(a[c])):this.getValues(a[c])),this.captureId+=1);return b},safeCollect:function(b,c,d){b[c]?a.types[toString.call(b[c])]!=="array"&&(b[c]=[b[c]],b[c].push(d)):b[c]=d},result:function(){this.capture(this.tree);return this.captures}};return a}()})()