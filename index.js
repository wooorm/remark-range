'use strict';

/**
 * Visit.
 *
 * @param {Node} tree
 * @param {function(node)} callback
 */
function visit(tree, callback) {
    /**
     * Visit a single node.
     */
    function one(node) {
        callback(node);

        var children = node.children;
        var index = -1;
        var length = children ? children.length : 0;

        while (++index < length) {
            one(children[index]);
        }
    }

    one(tree);
}

/**
 * Calculate offsets for `lines`.
 *
 * @param {Array.<string>} lines
 * @return {Array.<number>}
 */
function toOffsets(lines) {
    var total = 0;
    var index = -1;
    var length = lines.length;
    var result = [];

    while (++index < length) {
        result[index] = total += lines[index].length + 1;
    }

    return result;
}

/**
 * Add an offset based on `offsets` to `position`.
 *
 * @param {Object} position
 */
function addRange(position, offsets) {
    position.offset = ((offsets[position.line - 2] || 0) +
        position.column - 1) || 0;
}

/**
 * Add ranges for `doc` to `ast`.
 *
 * @param {Node} ast
 * @param {File} file
 */
function transformer(ast, file) {
    var contents = String(file).split('\n');

    /*
     * Invalid.
     */

    if (!file || typeof file.contents !== 'string') {
        throw new Error('Missing `file` for mdast-range');
    }

    /*
     * Get length at each line.
     */

    contents = toOffsets(contents);

    /*
     * Add `offset` on both `start` and `end`.
     */

    visit(ast, function (node) {
        var position = node.position;

        if (position && position.start) {
            addRange(position.start, contents);
        }

        if (position && position.end) {
            addRange(position.end, contents);
        }
    });
}

/**
 * Attacher.
 *
 * @return {Function} - `transformer`.
 */
function attacher() {
    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
