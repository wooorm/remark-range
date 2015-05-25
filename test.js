'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var range = require('./');
var mdast = require('mdast');
var assert = require('assert');

/**
 * Shortcut to process.
 *
 * @param {string} value
 * @return {Node}
 */
function process(value, done) {
    return mdast.use(range).run(mdast.parse(value), value, done);
}

/**
 * Shortcut to `node.position.start.offset`.
 *
 * @param {Node} node
 * @return {number}
 */
function start(node) {
    return node.position.start.offset;
}

/**
 * Shortcut to `node.position.end.offset`.
 *
 * @param {Node} node
 * @return {number}
 */
function end(node) {
    return node.position.end.offset;
}

/*
 * Tests.
 */

describe('mdast-range()', function () {
    it('should throw without file', function () {
        assert.throws(function () {
            range(mdast())(mdast.parse('Foo'));
        }, /Missing `file` for mdast-range/);
    });

    it('should not throw with empty file', function () {
        mdast.use(range).process('');
    });

    it('should expose `offsetToPosition()`', function (done) {
        mdast.use(range).process('', function (err, doc, file) {
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

            assert(start(ast) === 0);
            assert(end(ast) === input.length);

            assert(start(paragraph) === 0);
            assert(end(paragraph) === input.length);

            // emphasis
            assert(start(children[0]) === 0);
            assert(end(children[0]) === 6);
            assert(start(children[0].children[0]) === 1);
            assert(end(children[0].children[0]) === 5);

            // text
            assert(start(children[1]) === 6);
            assert(end(children[1]) === 11);

            // strong
            assert(start(children[2]) === 11);
            assert(end(children[2]) === 19);
            assert(start(children[2].children[0]) === 13);
            assert(end(children[2].children[0]) === 17);

            // text
            assert(start(children[3]) === 19);
            assert(end(children[3]) === 29);

            // deletion
            assert(start(children[4]) === 29);
            assert(end(children[4]) === 36);
            assert(start(children[4].children[0]) === 31);
            assert(end(children[4].children[0]) === 34);

            // text
            assert(start(children[5]) === 36);
            assert(end(children[5]) === 41);

            // link
            assert(start(children[6]) === 41);
            assert(end(children[6]) === 48);
            assert(start(children[6].children[0]) === 42);
            assert(end(children[6].children[0]) === 45);

            done(err);
        });
    });

    it('should reverse offsets with `offsetToPosition()`', function (done) {
        mdast.use(range).process('a\nb\n', function (err, doc, file) {
            var pos;

            pos = file.offsetToPosition(0);

            assert(pos.line === 1);
            assert(pos.column === 1);

            pos = file.offsetToPosition(2);

            assert(pos.line === 2);
            assert(pos.column === 1);

            pos = file.offsetToPosition(4);

            assert(pos.line === 3);
            assert(pos.column === 1);

            pos = file.offsetToPosition(-1);

            assert(pos.line === undefined);
            assert(pos.column === undefined);

            pos = file.offsetToPosition(5);

            assert(pos.line === undefined);
            assert(pos.column === undefined);

            done(err);
        });
    });
});
