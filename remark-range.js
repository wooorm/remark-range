(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.remarkRange = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:range
 * @fileoverview Patch index-based range on mdast nodes.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var visit = require('unist-util-visit');

/**
 * Calculate offsets for `lines`.
 *
 * @param {Array.<string>} lines - Lines to compile.
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
 * @param {Object} position - Position.
 */
function addRange(position, fn) {
    position.offset = fn(position);
}

/**
 * Factory to reverse an offset into a line--column
 * tuple.
 *
 * @param {Array.<number>} offsets - Offsets, as returned
 *   by `toOffsets()`.
 * @return {Function} - Bound method.
 */
function positionToOffsetFactory(offsets) {
    /**
     * Calculate offsets for `lines`.
     *
     * @param {Object} position - Position.
     * @return {Object} - Object with `line` and `colymn`
     *   properties based on the bound `offsets`.
     */
    function positionToOffset(position) {
        var line = position && position.line;
        var column = position && position.column;

        if (!isNaN(line) && !isNaN(column)) {
            return ((offsets[line - 2] || 0) + column - 1) || 0;
        }

        return -1;
    }

    return positionToOffset;
}

/**
 * Factory to reverse an offset into a line--column
 * tuple.
 *
 * @param {Array.<number>} offsets - Offsets, as returned
 *   by `toOffsets()`.
 * @return {Function} - Bound method.
 */
function offsetToPositionFactory(offsets) {
    /**
     * Calculate offsets for `lines`.
     *
     * @param {number} offset - Offset.
     * @return {Object} - Object with `line` and `colymn`
     *   properties based on the bound `offsets`.
     */
    function offsetToPosition(offset) {
        var index = -1;
        var length = offsets.length;

        if (offset < 0) {
            return {};
        }

        while (++index < length) {
            if (offsets[index] > offset) {
                return {
                    'line': index + 1,
                    'column': (offset - (offsets[index - 1] || 0)) + 1
                };
            }
        }

        return {};
    }

    return offsetToPosition;
}

/**
 * Add ranges for `ast`.
 *
 * @param {Node} ast - Context to patch.
 * @param {VFile} file - Virtual file.
 */
function transformer(ast, file) {
    var contents = String(file).split('\n');
    var positionToOffset;

    /*
     * Invalid.
     */

    if (!file || typeof file.contents !== 'string') {
        throw new Error('Missing `file` for remark-range');
    }

    /*
     * Construct.
     */

    contents = toOffsets(contents);
    positionToOffset = positionToOffsetFactory(contents);

    /*
     * Expose methods.
     */

    file.offsetToPosition = offsetToPositionFactory(contents);
    file.positionToOffset = positionToOffset;

    /*
     * Add `offset` on both `start` and `end`.
     */

    visit(ast, function (node) {
        var position = node.position;

        if (position && position.start) {
            addRange(position.start, positionToOffset);
        }

        if (position && position.end) {
            addRange(position.end, positionToOffset);
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

},{"unist-util-visit":2}],2:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module unist:util:visit
 * @fileoverview Utility to recursively walk over unist nodes.
 */

'use strict';

/**
 * Walk forwards.
 *
 * @param {Array.<*>} values - Things to iterate over,
 *   forwards.
 * @param {function(*, number): boolean} callback - Function
 *   to invoke.
 * @return {boolean} - False if iteration stopped.
 */
function forwards(values, callback) {
    var index = -1;
    var length = values.length;

    while (++index < length) {
        if (callback(values[index], index) === false) {
            return false;
        }
    }

    return true;
}

/**
 * Walk backwards.
 *
 * @param {Array.<*>} values - Things to iterate over,
 *   backwards.
 * @param {function(*, number): boolean} callback - Function
 *   to invoke.
 * @return {boolean} - False if iteration stopped.
 */
function backwards(values, callback) {
    var index = values.length;
    var length = -1;

    while (--index > length) {
        if (callback(values[index], index) === false) {
            return false;
        }
    }

    return true;
}

/**
 * Visit.
 *
 * @param {Node} tree - Root node
 * @param {string} [type] - Node type.
 * @param {function(node): boolean?} callback - Invoked
 *   with each found node.  Can return `false` to stop.
 * @param {boolean} [reverse] - By default, `visit` will
 *   walk forwards, when `reverse` is `true`, `visit`
 *   walks backwards.
 */
function visit(tree, type, callback, reverse) {
    var iterate;
    var one;
    var all;

    if (typeof type === 'function') {
        reverse = callback;
        callback = type;
        type = null;
    }

    iterate = reverse ? backwards : forwards;

    /**
     * Visit `children` in `parent`.
     */
    all = function (children, parent) {
        return iterate(children, function (child, index) {
            return child && one(child, index, parent);
        });
    };

    /**
     * Visit a single node.
     */
    one = function (node, index, parent) {
        var result;

        index = index || (parent ? 0 : null);

        if (!type || node.type === type) {
            result = callback(node, index, parent || null);
        }

        if (node.children && result !== false) {
            return all(node.children, node);
        }

        return result;
    };

    one(tree);
}

/*
 * Expose.
 */

module.exports = visit;

},{}]},{},[1])(1)
});