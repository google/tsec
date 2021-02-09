import 'jasmine';
import * as fs from 'fs';
import * as path from 'path';

import {compileAndCheck, SimpleFailure} from './harness';

let goldenDir = './test';

let assetPath = path.resolve(__dirname, 'asset');

const GOLDEN_REFERENCE =
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    <{[key: string]: SimpleFailure[]}>JSON.parse(fs.readFileSync(
        path.resolve(goldenDir, 'golden.json'), {encoding: 'utf8'}));

describe('Test each rules', () => {
  for (const [testItem, results] of Object.entries(GOLDEN_REFERENCE)) {
    it(testItem, () => {
      const check = compileAndCheck(path.resolve(assetPath, testItem));
      expect(check).toEqual(results);
    });
  }
});
