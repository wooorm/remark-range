/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:range
 * @fileoverview Test suite for `remark-range`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var remark = require('remark');
var range = require('./');

/**
 * Shortcut to process.
 *
 * @param {string} value - Value to process.
 * @param {Function} done - Callback.
 */
function process(value, done) {
    remark.use(range).run(remark.parse(value), value, done);
}

/**
 * Shortcut to `node.position.start.offset`.
 *
 * @param {Node} node - Node to search.
 * @return {number} - Start offset.
 */
function start(node) {
    return node.position.start.offset;
}

/**
 * Shortcut to `node.position.end.offset`.
 *
 * @param {Node} node - Node to search.
 * @return {number} - End offset.
 */
function end(node) {
    return node.position.end.offset;
}

/*
 * Tests.
 */

test('remark-range()', function (t) {
    t.throws(
        function () {
            range(remark())(remark.parse('Foo'));
        },
        /Missing `file` for remark-range/,
        'should throw without file'
    );

    t.doesNotThrow(function () {
        remark.use(range).process('');
    }, 'should not throw with empty file');

    remark.use(range).process('', function (err, file) {
        t.equal(
            'offsetToPosition' in file,
            true,
            'should expose `offsetToPosition()`'
        );
    });

    t.doesNotThrow(function () {
        remark.use(range).run({
            'type': 'text',
            'value': 'foo'
        });

        remark.use(range).run({
            'type': 'text',
            'value': 'foo',
            'position': {}
        });

        remark.use(range).run({
            'type': 'text',
            'value': 'foo',
            'position': {
                'start': {},
                'end': {}
            }
        });
    }, 'should not fail on nodes without position');

    // it('should add `offset` to Position\'s', function (done) {
    var input = '_This_ and **that**\nbut also ~~foo~~ and [bar]()';

    process(input, function (err, ast) {
        var paragraph = ast.children[0];
        var children = paragraph.children;

        t.ifErr(err, 'should not fail');

        t.equal(start(ast), 0);
        t.equal(end(ast), input.length);

        t.equal(start(paragraph), 0);
        t.equal(end(paragraph), input.length);

        // emphasis
        t.equal(start(children[0]), 0);
        t.equal(end(children[0]), 6);
        t.equal(start(children[0].children[0]), 1);
        t.equal(end(children[0].children[0]), 5);

        // text
        t.equal(start(children[1]), 6);
        t.equal(end(children[1]), 11);

        // strong
        t.equal(start(children[2]), 11);
        t.equal(end(children[2]), 19);
        t.equal(start(children[2].children[0]), 13);
        t.equal(end(children[2].children[0]), 17);

        // text
        t.equal(start(children[3]), 19);
        t.equal(end(children[3]), 29);

        // deletion
        t.equal(start(children[4]), 29);
        t.equal(end(children[4]), 36);
        t.equal(start(children[4].children[0]), 31);
        t.equal(end(children[4].children[0]), 34);

        // text
        t.equal(start(children[5]), 36);
        t.equal(end(children[5]), 41);

        // link
        t.equal(start(children[6]), 41);
        t.equal(end(children[6]), 48);
        t.equal(start(children[6].children[0]), 42);
        t.equal(end(children[6].children[0]), 45);
    });

    remark.use(range).process('a\nb\n', function (err, file) {
        var pos = file.offsetToPosition(0);

        t.ifErr(err, 'should not fail');

        t.equal(pos.line, 1);
        t.equal(pos.column, 1);

        pos = file.offsetToPosition(2);

        t.equal(pos.line, 2);
        t.equal(pos.column, 1);

        pos = file.offsetToPosition(4);

        t.equal(pos.line, 3);
        t.equal(pos.column, 1);

        pos = file.offsetToPosition(-1);

        t.equal(pos.line, undefined);
        t.equal(pos.column, undefined);

        pos = file.offsetToPosition(5);

        t.equal(pos.line, undefined);
        t.equal(pos.column, undefined);
    });

    t.end();
});
