'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var mdast = require('mdast');
var range = require('./');

/*
 * Methods.
 */

var equal = assert.strictEqual;
var throws = assert.throws;

/**
 * Shortcut to process.
 *
 * @param {string} value - Value to process.
 * @param {Function} done - Callback.
 */
function process(value, done) {
    mdast.use(range).run(mdast.parse(value), value, done);
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

describe('mdast-range()', function () {
    it('should throw without file', function () {
        throws(function () {
            range(mdast())(mdast.parse('Foo'));
        }, /Missing `file` for mdast-range/);
    });

    it('should not throw with empty file', function () {
        mdast.use(range).process('');
    });

    it('should expose `offsetToPosition()`', function (done) {
        mdast.use(range).process('', function (err, file) {
            assert('offsetToPosition' in file);
            done(err);
        });
    });

    it('should not fail on nodes without position', function () {
        mdast.use(range).run({
            'type': 'text',
            'value': 'foo'
        });

        mdast.use(range).run({
            'type': 'text',
            'value': 'foo',
            'position': {}
        });

        mdast.use(range).run({
            'type': 'text',
            'value': 'foo',
            'position': {
                'start': {},
                'end': {}
            }
        });
    });

    it('should add `offset` to Position\'s', function (done) {
        var input = '_This_ and **that**\nbut also ~~foo~~ and [bar]()';

        process(input, function (err, ast) {
            var paragraph = ast.children[0];
            var children = paragraph.children;

            equal(start(ast), 0);
            equal(end(ast), input.length);

            equal(start(paragraph), 0);
            equal(end(paragraph), input.length);

            // emphasis
            equal(start(children[0]), 0);
            equal(end(children[0]), 6);
            equal(start(children[0].children[0]), 1);
            equal(end(children[0].children[0]), 5);

            // text
            equal(start(children[1]), 6);
            equal(end(children[1]), 11);

            // strong
            equal(start(children[2]), 11);
            equal(end(children[2]), 19);
            equal(start(children[2].children[0]), 13);
            equal(end(children[2].children[0]), 17);

            // text
            equal(start(children[3]), 19);
            equal(end(children[3]), 29);

            // deletion
            equal(start(children[4]), 29);
            equal(end(children[4]), 36);
            equal(start(children[4].children[0]), 31);
            equal(end(children[4].children[0]), 34);

            // text
            equal(start(children[5]), 36);
            equal(end(children[5]), 41);

            // link
            equal(start(children[6]), 41);
            equal(end(children[6]), 48);
            equal(start(children[6].children[0]), 42);
            equal(end(children[6].children[0]), 45);

            done(err);
        });
    });

    it('should reverse offsets with `offsetToPosition()`', function (done) {
        mdast.use(range).process('a\nb\n', function (err, file) {
            var pos;

            pos = file.offsetToPosition(0);

            equal(pos.line, 1);
            equal(pos.column, 1);

            pos = file.offsetToPosition(2);

            equal(pos.line, 2);
            equal(pos.column, 1);

            pos = file.offsetToPosition(4);

            equal(pos.line, 3);
            equal(pos.column, 1);

            pos = file.offsetToPosition(-1);

            equal(pos.line, undefined);
            equal(pos.column, undefined);

            pos = file.offsetToPosition(5);

            equal(pos.line, undefined);
            equal(pos.column, undefined);

            done(err);
        });
    });
});
