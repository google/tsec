// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
