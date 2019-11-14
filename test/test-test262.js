/* eslint-disable no-throw-literal, func-names, no-underscore-dangle, no-self-compare */
import { test } from 'tape-promise/tape';
import { makeEvaluators } from '@agoric/evaluate';
import makeModuleTransformer from '@agoric/transform-module';
import * as babelCore from '@babel/core';
import fs from 'fs';
import path from 'path';
import inspect from 'object-inspect';
import test262Parser from 'test262-parser';

import testList from './modules-test262';

import makeImporter, * as mi from '../src';

const readFile = ({ pathname }) => fs.promises.readFile(pathname, 'utf-8');

const protoHandlers = new Map([['file', readFile]]);

function readTestInfo(filePath) {
  const contents = fs.readFileSync(filePath, 'utf-8');
  const file = { contents };
  test262Parser.parseFile(file);
  return file.attrs;
}

function hasExcludedPath(filePath) {
  // Files that are not tests, or not compatible.
  const excludePaths = ['import.meta', 'top-level-await', '_FIXTURE.js'];
  return excludePaths.some(exclude => filePath.includes(exclude));
}

function hasExcludedInfo(testInfo) {
  const { description, features } = testInfo;
  // return !features || !features.includes('dynamic-import');
  if (Array.isArray(features)) {
    if (features.includes('dynamic-import')) return true; // https://github.com/Agoric/make-importer/issues/37
  }
  if (typeof description === 'string') {
    const excludePaths = [
      'Imported binding reflects state', // not supported as documented
      'Binding is created', // not supported as documented
      'Mutable bindings', // not supported as documented
      'Immutable binding', // not supported as documented
      'Test Object.prototype.hasOwnProperty() with uninitialized binding', // not supported as documented
      'Test Object.keys() with uninitialized binding', // not supported as documented
      'An ImportClause may contain both an ImportedDefaultBinding and a NameSpaceImport', // not supported as documented
      // uncomment to reduce the number of failed assertions

      'Statement cannot contain an `import` declaration', // https://github.com/Agoric/transform-module/issues/5
      'Expression cannot contain an `import` declaration', // https://github.com/Agoric/transform-module/issues/5
      'Statement cannot contain an `export` declaration', // https://github.com/Agoric/transform-module/issues/5
      'Expression cannot contain an `export` declaration', // https://github.com/Agoric/transform-module/issues/5

      'Default AssignmentExpression (which can be recognized as an "anonymous"', // https://github.com/Agoric/make-importer/issues/10

      'An exported default "anonymous"', // https://github.com/Agoric/make-importer/issues/12
      'Default "anonymous', // https://github.com/Agoric/make-importer/issues/12
      'An exported default "named"', // https://github.com/Agoric/make-importer/issues/12
      'Modifications to default binding that occur after dependency has been evaluated', // https://github.com/Agoric/make-importer/issues/12

      'The [[OwnPropertyKeys]] internal method reflects the sorted order', // https://github.com/Agoric/make-importer/issues/24

      'Behavior of the [[HasProperty]] internal method', // https://github.com/Agoric/make-importer/issues/25
      'Behavior of the [[GetOwnProperty]] internal method', // https://github.com/Agoric/make-importer/issues/25
      'Behavior of the [[Get]] internal method', // https://github.com/Agoric/make-importer/issues/25
      'The [[OwnPropertyKeys]] internal method', // https://github.com/Agoric/make-importer/issues/25
      'The [[IsExtensible]] internal method', // https://github.com/Agoric/make-importer/issues/25
      'The [[Set]] internal method', // https://github.com/Agoric/make-importer/issues/25
      '[[Delete]] behavior', // https://github.com/Agoric/make-importer/issues/25
      'The [[DefineOwnProperty]] internal method', // https://github.com/Agoric/make-importer/issues/25

      'Ambiguous exports are not reflected', // https://github.com/Agoric/make-importer/issues/28

      '`Symbol.toStringTag` property descriptor', // https://github.com/Agoric/make-importer/issues/29

      'Hashbang comments', // https://github.com/Agoric/make-importer/issues/34

      'The class-name is present', // https://github.com/Agoric/make-importer/issues/35

      'Module is evaluated exactly once', // https://github.com/Agoric/make-importer/issues/36
      'Requested modules are evaluated exactly once', // https://github.com/Agoric/make-importer/issues/36
    ];
    return excludePaths.some(exclude => description.startsWith(exclude));
  }
  return false;
}

function makeTest262Importer(rootUrl) {
  const boxedTransform = [];
  const { evaluateProgram } = makeEvaluators();
  const importer = makeImporter({
    resolve: mi.makeRootedResolver(rootUrl),
    locate: mi.makeSuffixLocator('.js'),
    retrieve: mi.makeProtocolRetriever(protoHandlers),
    rewrite: mi.makeTransformRewriter(boxedTransform),
    rootLinker: mi.makeEvaluateLinker(evaluateProgram),
  });
  boxedTransform[0] = makeModuleTransformer(babelCore, importer);
  return { importer, evaluateProgram };
}

function injectTest262Harness(globalObject, t) {
  // Use the global object, not the endowments, since
  // test262 expects the test harness to be present on
  // the global object, not on the contour.

  // ===
  // test262/harness/sta.js
  // An error class to avoid false positives when testing for thrown exceptions
  // A function to explicitly throw an exception using the Test262Error class
  function Test262Error(message) {
    this.message = message || '';
  }

  Test262Error.prototype.toString = function() {
    return `Test262Error: ${this.message}`;
  };

  function $ERROR(message) {
    throw new Test262Error(message);
  }

  function $DONOTEVALUATE() {
    throw 'Test262: This statement should not be evaluated.';
  }

  Object.assign(globalObject, {
    Test262Error,
    $ERROR,
    $DONOTEVALUATE,
  });

  // ===
  // test262/harness/assert.js
  // Collection of assertion functions used throughout test262
  const assert = function assert(condition, message) {
    t.ok(condition, message);
  };

  assert._isSameValue = function(a, b) {
    if (a === b) {
      // Handle +/-0 vs. -/+0
      return a !== 0 || 1 / a === 1 / b;
    }

    // Handle NaN vs. NaN
    return a !== a && b !== b;
  };

  assert.sameValue = function(found, expected, message) {
    if (assert._isSameValue(found, expected)) {
      t.pass(message);
    } else {
      const ex = inspect(expected);
      const ac = inspect(found);

      t.fail(
        `${message || ''} operator: sameValue expected: ${ex} actual: ${ac}`,
      );
    }
  };

  assert.notSameValue = function(found, expected, message) {
    if (!assert._isSameValue(found, expected)) {
      t.pass(message);
    } else {
      const ex = inspect(expected);
      const ac = inspect(found);

      t.fail(
        `${message || ''} operator: notSameValue expected: ${ex} actual: ${ac}`,
      );
    }
  };

  assert.throws = function(expectedErrorConstructor, func, message) {
    t.throws(func, expectedErrorConstructor, message);
  };

  Object.assign(globalObject, { assert });

  // ===
  // fnGlobalObject.js
  // Produce a reliable global object
  function fnGlobalObject() {
    return globalObject;
  }

  Object.assign(globalObject, { fnGlobalObject });

  // ===
  // doneprintHandle.js

  function __consolePrintHandle__(msg) {
    t.message(msg);
  }

  function $DONE(error) {
    if (error) {
      if (typeof error === 'object' && error !== null && 'name' in error) {
        t.fail(`Test262:AsyncTestFailure: ${error.name}: ${error.message}`);
      } else {
        t.fail(`Test262:AsyncTestFailure:Test262Error: ${error}`);
      }
    } else {
      t.pass('Test262:AsyncTestComplete');
    }
  }

  Object.assign(globalObject, { __consolePrintHandle__, $DONE });

  // ===

  function print(message) {
    console.log(message);
  }

  Object.assign(globalObject, { print });
}

async function executeTest(testInfo, rootPath, filePath) {
  const displayPath = filePath.replace(rootPath, 'test262');
  const relativePath = filePath.replace(rootPath, '.');

  test(displayPath, async t => {
    // Provide information about the test.
    if (
      typeof testInfo === 'object' &&
      typeof testInfo.description === 'string'
    ) {
      const esid = testInfo.esid || '(no esid)';
      const description = testInfo.description || '(no description)';
      t.comment(`${esid}: ${description}`);
    }

    try {
      const rootUrl = `file://${rootPath}`;
      const { importer, evaluateProgram } = makeTest262Importer(rootUrl);
      const globalObject = evaluateProgram('Function("return this")()');
      injectTest262Harness(globalObject, t);

      await importer({ spec: relativePath, url: `${rootUrl}/` }, {});
    } catch (e) {
      if (testInfo.negative) {
        if (e.constructor.name !== testInfo.negative.type) {
          // Display the unexpected error.
          t.error(e, 'unexpected error');
        } else {
          // Diplay that the error matched.
          t.pass(`should throw ${testInfo.negative.type}`);
        }
      } else {
        // Only negative tests are expected to throw.
        t.error(e, 'should not throw');
      }
    } finally {
      t.end();
    }
  });
}

async function skipTest(testInfo, rootPath, filePath) {
  const displayPath = filePath.replace(rootPath, 'test262');
  test(displayPath, { skip: true });
}

(async () => {
  const rootPath = path.join(__dirname, '../test262/test');

  // select paths using "grep '\[[^]]*module' -r test262/test/"
  for await (const testPath of testList.split('\n')) {
    if (testPath.endsWith('.js')) {
      const filePath = path.join(__dirname, '..', testPath);
      const testInfo = readTestInfo(filePath);
      if (hasExcludedPath(testPath) || hasExcludedInfo(testInfo)) {
        skipTest(testInfo, rootPath, filePath);
      } else {
        await executeTest(testInfo, rootPath, filePath);
      }
    }
  }
})();
