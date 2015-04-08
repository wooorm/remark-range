// Dependencies and input:
var range = require('./index.js');
var mdast = require('mdast').use(range);
var doc = 'Some *emphasis*,\n**strongness**,\nand `code`.';

// And when the plugin is run, the ast looks as follows:
mdast.process(doc);

// Note the `offset` properties.
console.log('json', JSON.stringify(mdast.run(mdast.parse(doc), doc), 0, 2));
