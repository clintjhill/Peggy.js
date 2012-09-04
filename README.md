Peggy.js - A simpler PEG generator in JavaScript
======================================
## Description
Please visit [http://clintjhill.github.com/Peggy.js/](http://clintjhill.github.com/Peggy.js/) for more information.

## API

#### Functions (as described here: [Parsing Expression Grammar](http://en.wikipedia.org/wiki/Parsing_expression_grammar))
- sequence 			[val, val]
- choice 			["||", val, val]
- 0 or more 		["*", val]
- 1 or more			["+", val]
- optional (0 or 1)	["?", val]
- and 				["&", val]
- not 				["!", val]

```javascript	
var css = new Peggy({
	"sheet": ["rules", "medias", "imports"],
	"rules": ["+", "rule"],
	"medias": ["*", "media"],
	"imports": ["*", "import"],
	"rule": [
		"ruleName",
		"openBracket",
		"ruleBody",
		"closeBracket"
	],
	"ruleName": [/\w+/, ["*", "whitespace"]],
	"openBracket": [/\{/],
	"ruleBody": ["*", "property"],
	"closeBracket": [/\}/],
	"property": [
		"propertyName",
		"propertyValue"
	],
	"propertyName": [/\w+/, ["*", "whitespace"], /:/, ["*", "whitespace"]],
	"propertyValue": [/\w+/, ["*", "whitespace"], /;/, ["*", "whitespace"]],
	"whitespace": [/\s+/]
},
{
	"sheet": function(rules, medias, imports){

	},
	"rules": function(rule){

	},
	"rule": function(ruleName, openBracket, ruleBody, closeBracket){

	},
	"property": function(propertyName, propertyValue){

	}
});
```

## License 

(The MIT License)

Copyright (c) 2012 Clint Hill &lt;clint.hill@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
