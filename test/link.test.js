import { test } from 'tape-promise/tape';

import { evaluateProgram } from '@agoric/evaluate';
import { makeEvaluateLinker } from '../src';

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

test('evaluate linker', async t => {
  try {
    const assertEvaluate = (src, endowments, options = {}) => {
      if (!options.allowHidden) {
        throw TypeError('allowHidden is not set');
      }
      return evaluateProgramWrap(src, endowments, options);
    };
    const rootLinker = makeEvaluateLinker(assertEvaluate);
    const linkageMap = new Map([
      [
        'https://www.example.com/foo/abc',
        {
          functorSource: `\
${async ({ liveVar, imports }) => {
  let def;
  await imports(new Map([['./def', new Map([['def', [$ha => (def = $ha)]]])]]));

  liveVar.abc(def);
}}`,
          exportAlls: [],
          imports: { './def': ['def'] },
          fixedExportMap: {},
          liveExportMap: { abc: ['abc', false] },
          moduleLocations: new Map([
            ['./def', 'https://www.example.com/foo/def'],
          ]),
          moduleLocation: 'https://www.example.com/foo/abc',
        },
      ],
      [
        'https://www.example.com/foo/def',
        {
          exportAlls: [],
          functorSource: `\
async ({ imports, liveVar }) => { await imports(new Map()); liveVar.lo(456); lo ++; }`,
          imports: {},
          fixedExportMap: {},
          liveExportMap: { def: ['lo', true] },
          moduleLocations: new Map(),
          moduleLocation: 'https://www.example.com/foo/def',
        },
      ],
    ]);
    const recursiveLink = (moduleLocation, linker, preEndowments) => {
      const linkageRecord = linkageMap.get(moduleLocation);
      return linker.link(linkageRecord, recursiveLink, preEndowments);
    };
    const mi = recursiveLink('https://www.example.com/foo/abc', rootLinker, {});
    const moduleNS = await mi.getNamespace();
    t.deepEqual(moduleNS, { abc: 457 }, 'linkage success');
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});
