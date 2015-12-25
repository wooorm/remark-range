# remark-range [![Build Status](https://img.shields.io/travis/wooorm/remark-range.svg)](https://travis-ci.org/wooorm/remark-range) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/remark-range.svg)](https://codecov.io/github/wooorm/remark-range)

Patch index-based ranges on **remark** nodes, so you can slice sources!

## Installation

[npm](https://docs.npmjs.com/cli/install)

```bash
npm install remark-range
```

**remark-range** is also available for [duo](http://duojs.org/#getting-started),
and as an AMD, CommonJS, and globals module, [uncompressed and
compressed](https://github.com/wooorm/remark-range/releases).

## Table of Contents

*   [Usage](#usage)

*   [API](#api)

    *   [remark.use(range)](#remarkuserange)

*   [License](#license)

## Usage

Dependencies and input:

```javascript
var range = require('remark-range');
var remark = require('remark').use(range);
var doc = 'Some *emphasis*,\n**strongness**,\nand `code`.';
```

And when the plugin is run, the ast looks as follows:

```javascript
remark.process(doc);
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

### [remark](https://github.com/wooorm/remark#api).[use](https://github.com/wooorm/remark#remarkuseplugin-options)(range)

Adds `offset` to each node’s [**Position**](https://github.com/wooorm/remark/blob/master/doc/Nodes.md#location).

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
remark.use(range).process('foo', function (err, doc, file) {
    file.offsetToPosition(0);
    // Yields: `{line: 1, column: 1}`
});
```

To turn any position object, use `file.positionToOffset()`:

```javascript
remark.use(range).process('foo', function (err, doc, file) {
    var pos = file.offsetToPosition(0);

    file.positionToOffset(pos);
    // Yields: `0`.
});
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
