// test AssignmentNode
var assert = require('assert');
var approx = require('../../../tools/approx');
var math = require('../../../index');
var Node = require('../../../lib/expression/node/Node');
var ConstantNode = require('../../../lib/expression/node/ConstantNode');
var SymbolNode = require('../../../lib/expression/node/SymbolNode');
var ArrayNode = require('../../../lib/expression/node/ArrayNode');
var RangeNode = require('../../../lib/expression/node/RangeNode');
var AssignmentNode = require('../../../lib/expression/node/AssignmentNode');
var OperatorNode = require('../../../lib/expression/node/OperatorNode');

describe('AssignmentNode', function() {

  it ('should create an AssignmentNode', function () {
    var n = new AssignmentNode('a', new Node());
    assert(n instanceof AssignmentNode);
    assert(n instanceof Node);
    assert.equal(n.type, 'AssignmentNode');
  });

  it ('should throw an error when calling without new operator', function () {
    assert.throws(function () {AssignmentNode('a', new Node())}, SyntaxError);
  });

  it ('should throw an error when creating an AssignmentNode with a reserved keyword', function () {
    assert.throws(function () {
      new AssignmentNode('end', new Node());
    }, /Illegal symbol name/)
  });

  it ('should throw an error on wrong constructor arguments', function () {
    assert.throws(function () {new AssignmentNode()}, TypeError );
    assert.throws(function () {new AssignmentNode(new Node())}, TypeError );
    assert.throws(function () {new AssignmentNode('a')}, TypeError );
    assert.throws(function () {new AssignmentNode(2, new Node())}, TypeError );
    assert.throws(function () {new AssignmentNode(new Node(), new Node())}, TypeError );
  });

  it ('should compile an AssignmentNode', function () {
    var b = new ConstantNode(3);
    var n = new AssignmentNode('b', b);

    var expr = n.compile(math);

    var scope = {};
    assert.equal(expr.eval(scope), 3);
    assert.equal(scope.b, 3);
  });

  it ('should filter an AssignmentNode', function () {
    var a = new ConstantNode(1);
    var b = new SymbolNode('x');
    var c = new ConstantNode(2);
    var d = new ArrayNode([a, b, c]);
    var e = new AssignmentNode('array', d);

    assert.deepEqual(e.filter(function (node) {return node instanceof AssignmentNode}),[e]);
    assert.deepEqual(e.filter(function (node) {return node instanceof SymbolNode}),    [b]);
    assert.deepEqual(e.filter(function (node) {return node instanceof RangeNode}),     []);
    assert.deepEqual(e.filter(function (node) {return node instanceof ConstantNode}),  [a, c]);
    assert.deepEqual(e.filter(function (node) {return node instanceof ConstantNode && node.value == '2'}),  [c]);
  });

  it ('should filter an AssignmentNode without expression', function () {
    var e = new AssignmentNode('a', new ConstantNode(2));

    assert.deepEqual(e.filter(function (node) {return node instanceof AssignmentNode}),[e]);
    assert.deepEqual(e.filter(function (node) {return node instanceof SymbolNode}),    []);
  });

  it ('should transform an AssignmentNodes (nested) parameters', function () {
    // a = x + 2
    var a = new SymbolNode('x');
    var b = new ConstantNode(2);
    var c = new OperatorNode('+', 'add', [a, b]);
    var d = new AssignmentNode('a', c);

    var e = new ConstantNode(3);
    var f = d.transform(function (node) {
      return node instanceof SymbolNode && node.name == 'x' ? e : node;
    });

    assert.strictEqual(f, d);
    assert.deepEqual(f.expr.args[0],  e);
    assert.deepEqual(f.expr.args[1],  b);
  });

  it ('should transform an AssignmentNode itself', function () {
    // a = x + 2
    var a = new SymbolNode('add');
    var b = new ConstantNode(2);
    var c = new OperatorNode('+', 'add', [a, b]);
    var d = new AssignmentNode('a', c);

    var e = new ConstantNode(5);
    var f = d.transform(function (node) {
      return node instanceof AssignmentNode ? e : node;
    });

    assert.strictEqual(f, e);
  });

  it ('should traverse an AssignmentNode', function () {
    // a = x + 2
    var b = new ConstantNode(2);
    var a = new AssignmentNode('a', b);

    var count = 0;
    a.traverse(function (node, index, parent) {
      count++;

      switch(count) {
        case 1:
          assert.strictEqual(node, a);
          assert.strictEqual(index, null);
          assert.strictEqual(parent, null);
          break;

        case 2:
          assert.strictEqual(node, b);
          assert.strictEqual(index, 'expr');
          assert.strictEqual(parent, a);
          break;
      }
    });

    assert.equal(count, 2);
  });

  it ('should clone an AssignmentNode', function () {
    // a = x + 2
    var a = new SymbolNode('add');
    var b = new ConstantNode(2);
    var c = new OperatorNode('+', 'add', [a, b]);
    var d = new AssignmentNode('a', c);

    var e = d.clone();
    assert(e instanceof AssignmentNode);
    assert.deepEqual(e, d);
    assert.notStrictEqual(e, d);
    assert.notStrictEqual(e.expr, d.expr);
  });

  it ('should stringify a AssignmentNode', function () {
    var b = new ConstantNode(3);
    var n = new AssignmentNode('b', b);

    assert.equal(n.toString(), 'b = 3');
  });

  it ('should LaTeX a AssignmentNode', function () {
    var b = new ConstantNode(3);
    var n = new AssignmentNode('b', b);

    assert.equal(n.toTex(), '{b}={3}');
  });

});