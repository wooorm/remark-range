// Dependencies and input:
var range = require('./index.js');
var remark = require('remark').use(range);
var doc = 'Some *emphasis*,\n**strongness**,\nand `code`.';

// And when the plugin is run, the ast looks as follows:
remark.process(doc);

// Note the `offset` properties.
console.log('json', JSON.stringify(remark.run(remark.parse(doc), doc), 0, 2));
