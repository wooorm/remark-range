(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mdastRange = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                    'column': (offset - offsets[index - 1] || 0) + 1
                };
            }
        }

        return {};
    }

    return offsetToPosition;
}

/**
 * Add ranges for `doc` to `ast`.
 *
 * @param {Node} ast
 * @param {File} file
 */
function transformer(ast, file) {
    var contents = String(file).split('\n');
    var positionToOffset;

    /*
     * Invalid.
     */

    if (!file || typeof file.contents !== 'string') {
        throw new Error('Missing `file` for mdast-range');
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

},{}]},{},[1])(1)
});