Peggy.js - A simpler PEG generator in JavaScript
======================================
## Description
Please visit [http://clintjhill.github.com/Peggy.js/](http://clintjhill.github.com/Peggy.js/) for more information.

## Requirements to build and run tests

1. GNU Make
2. [Node.js](http://nodejs.org/) 0.5.0 or greater
3. [Node.js Package Manager](http://npmjs.org/) 1.0.0 or greater
4. jasmine-node `npm install -g jasmine-node`

Roadmap
-------

1. (Done) Finish API with Repeat, And, But etc. 
2. (Done) Better parse exception handling on missed rule and/or tree inconsistencies.
3. Full line/character error messages.
4. Peggy grammar to allow for building rules with a Peggy syntax instead of the JavaScript API.
5. (Done) More testing.
6. (Done) More samples of both Peggy syntax and API.
7. (Done) Fully embed string scanner (maybe even optimize for use case).
8. Improve the value object that is returned to rule extensions.
9. (Done) Improve example pages - construct a tutorial.
10. (Done) Enhance rule API so that it includes: Zero or more, One or more, Optional, And predicate and Not predicate.

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
