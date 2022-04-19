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

import {resolve} from 'path';
import * as ts from 'typescript';

/** Create compiler host based on the content of tsconfig. */
export function createCompilerHost(config: ts.ParsedCommandLine):
    ts.CompilerHost {
  const host = ts.createCompilerHost(config.options, true);

  if (config.raw?.bazel) {
    // When running as a Bazel nodejs_test, we want to resolve relative modules
    // to Bazel-generated .d.ts files whenever possible. Therefore, we need to
    // make sure .ts files not listed in "files" of tsconfig are not visible to
    // the compiler host.
    const files = new Set(config.fileNames.map(p => resolve(p)));

    const originalFileExists = host.fileExists;

    host.fileExists = (path: string): boolean => {
      if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
        if (!files.has(resolve(path))) return false;
      }

      return originalFileExists.call(host, path);
    };
  }
  return host;
}
