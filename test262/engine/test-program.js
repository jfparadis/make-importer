import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeEvaluators } from '@agoric/evaluate';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  makeModuleTransformer,
  makeModuleAnalyzer,
} from '@agoric/transform-module';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as babelCore from '@babel/core';
import { getHarness } from './harness';
import { applyCorrections } from './corrections';

import makeImporter, * as mi from '../../src';

const typeAnalyzers = { module: makeModuleAnalyzer(babelCore) };

export async function test(testInfo) {
  const readFile = ({ pathname }) =>
    fs.promises.readFile(pathname, 'utf-8').then(str => {
      str = applyCorrections(str);
      if (pathname === testInfo.filePath) {
        str = `${getHarness(testInfo)}\n${str}`;
      }
      return { type: 'module', string: str };
    });

  const protoHandlers = { 'file:': readFile };

  const transforms = [];
  const { evaluateProgram } = makeEvaluators({ transforms });

  // ********

  const evaluateProgramWrap = (src, ...args) => {
    if (src.includes('once.default')) {
      console.log('\n***\n', src, '\n***\n');
      src = src.replace(
        'const { default: $c‍_default } = { default:',
        '$h\u200d_once.default({ default:',
      );
      src = src.replace('};$h‍_once.default($c‍_default);', '});');
      console.log('\n***\n', src, '\n***\n');
    }
    return evaluateProgram(src, ...args);
  };

  // ********

  const importer = makeImporter({
    resolve: mi.makeRootedResolver(testInfo.rootUrl),
    locate: mi.makeSuffixLocator('.js'),
    retrieve: mi.makeProtocolRetriever(protoHandlers),
    analyze: mi.makeTypeAnalyzer(typeAnalyzers),
    rootLinker: mi.makeEvaluateLinker(evaluateProgramWrap),
  });
  transforms[0] = makeModuleTransformer(babelCore, importer);

  await importer(
    { specifier: testInfo.relativePath, referrer: `${testInfo.rootUrl}/` },
    {},
  );
}
