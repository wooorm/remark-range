# mdast-range [![Build Status](https://img.shields.io/travis/wooorm/mdast-range.svg?style=flat)](https://travis-ci.org/wooorm/mdast-range) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast-range.svg?style=flat)](https://coveralls.io/r/wooorm/mdast-range?branch=master)

Add range information to **mdast** nodes, so you can slice sources!

## Installation

[npm](https://docs.npmjs.com/cli/install)

```bash
$ npm install mdast-range
```

[Component.js](https://github.com/componentjs/component)

```bash
$ component install wooorm/mdast-range
```

[Bower](http://bower.io/#install-packages)

```bash
$ bower install mdast-range
```

[Duo](http://duojs.org/#getting-started)

```javascript
var range = require('wooorm/mdast-range');
```

UMD: globals, AMD, and CommonJS ([uncompressed](mdast-range.js) and [compressed](mdast-range.min.js)):

```html
<script src="path/to/mdast.js"></script>
<script src="path/to/mdast-range.js"></script>
<script>
  mdast.use(mdastRange);
</script>
```

## Table of Contents

*   [Usage](#usage)

*   [API](#api)

    *   [mdast.use(range)](#mdastuserange)

*   [License](#license)

## Usage

Dependencies and input:

```javascript
var range = require('mdast-range');
var mdast = require('mdast').use(range);
var doc = 'Some *emphasis*,\n**strongness**,\nand `code`.';
```

And when the plugin is run, the ast looks as follows:

```javascript
mdast.process(doc);
```

Note the `offset` properties.

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "Some ",
          "position": {
            "start": {
              "line": 1,
              "column": 1,
              "offset": 0
            },
            "end": {
              "line": 1,
              "column": 6,
              "offset": 5
            },
            "indent": []
          }
        },
        {
          "type": "emphasis",
          "children": [
            {
              "type": "text",
              "value": "emphasis",
              "position": {
                "start": {
                  "line": 1,
                  "column": 7,
                  "offset": 6
                },
                "end": {
                  "line": 1,
                  "column": 15,
                  "offset": 14
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 6,
              "offset": 5
            },
            "end": {
              "line": 1,
              "column": 16,
              "offset": 15
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": ",\n",
          "position": {
            "start": {
              "line": 1,
              "column": 16,
              "offset": 15
            },
            "end": {
              "line": 2,
              "column": 1,
              "offset": 17
            },
            "indent": [
              1
            ]
          }
        },
        {
          "type": "strong",
          "children": [
            {
              "type": "text",
              "value": "strongness",
              "position": {
                "start": {
                  "line": 2,
                  "column": 3,
                  "offset": 19
                },
                "end": {
                  "line": 2,
                  "column": 13,
                  "offset": 29
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 2,
              "column": 1,
              "offset": 17
            },
            "end": {
              "line": 2,
              "column": 15,
              "offset": 31
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": ",\nand ",
          "position": {
            "start": {
              "line": 2,
              "column": 15,
              "offset": 31
            },
            "end": {
              "line": 3,
              "column": 5,
              "offset": 37
            },
            "indent": [
              1
            ]
          }
        },
        {
          "type": "inlineCode",
          "value": "code",
          "position": {
            "start": {
              "line": 3,
              "column": 5,
              "offset": 37
            },
            "end": {
              "line": 3,
              "column": 11,
              "offset": 43
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": ".",
          "position": {
            "start": {
              "line": 3,
              "column": 11,
              "offset": 43
            },
            "end": {
              "line": 3,
              "column": 12,
              "offset": 44
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1,
          "offset": 0
        },
        "end": {
          "line": 3,
          "column": 12,
          "offset": 44
        },
        "indent": [
          1,
          1
        ]
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1,
      "offset": 0
    },
    "end": {
      "line": 3,
      "column": 12,
      "offset": 44
    }
  }
}
```

## API

### [mdast](https://github.com/wooorm/mdast#api).[use](https://github.com/wooorm/mdast#mdastuseplugin-options)(range)

Adds `offset` to each node’s [**Position**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#location).

Where normally nodes have a line based positional information, such as:

```json
{
  "type": "break",
  "position": {
    "start": {
      "line": 2,
      "column": 5
    },
    "end": {
      "line": 3,
      "column": 1
    }
  }
}
```

...this plugin adds absolute positional information:

```json
{
  "type": "break",
  "position": {
    "start": {
      "line": 2,
      "column": 5,
      "offset": 25
    },
    "end": {
      "line": 3,
      "column": 1,
      "offset": 26
    }
  }
}
```

...so you can slice (or syntax highlight) the source:

```javascript
var line = doc.slice(node.position.start.offset, node.position.end.offset);
// Yields: `"\n"`
```

To reverse an `offset` into a position, pass it into `file.offsetToPosition()`:

```javascript
mdast.use(range).process('foo', function (err, doc, file) {
    file.offsetToPosition(0);
    // Yields: `{line: 1, column: 1}`
});
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
