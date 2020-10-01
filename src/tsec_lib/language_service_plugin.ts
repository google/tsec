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

/**
 * @fileoverview The language service plugin for tsec which shows violations
 * directly in the editor.
 */

import {Checker} from '../third_party/tsetse/checker';
import * as ts from 'typescript/lib/tsserverlibrary';

import {ENABLED_RULES} from '../rule_groups';

/**
 * The proxy design pattern, allowing us to customize behavior of the delegate
 * object.
 * This creates a property-by-property copy of the functions of the object, so
 * it can be mutated without affecting other users of the original object. See
 * https://en.wikipedia.org/wiki/Proxy_pattern
 */
function createProxy<T>(delegate: T): T {
  const proxy = Object.create(null);
  for (const [key, value] of Object.entries(delegate)) {
    if (typeof value === 'function') {
      proxy[key] = (...args: unknown[]) => value.apply(delegate, args);
    }
  }
  return proxy;
}


/**
 * Installs the Tsec language server plugin, which checks Tsec rules in your
 * editor and shows issues as semantic errors (red squiggly underline).
 */
function init(): ts.server.PluginModule {
  return {
    create(info: ts.server.PluginCreateInfo) {
      const oldService = info.languageService;
      const proxy = createProxy(oldService);

      // Note that this ignores suggested fixes. Fixes can be implemented in a
      // separate proxy method. See:
      // https://github.com/angelozerr/tslint-language-service/blob/880486c5f1db7961fb7170a621e25893332b2430/src/index.ts#L415
      proxy.getSemanticDiagnostics = (fileName: string) => {
        const result = [...oldService.getSemanticDiagnostics(fileName)];

        const program = oldService.getProgram();
        if (!program) {
          throw new Error(
              'Failed to initialize tsetse language_service_plugin: program is undefined',
          );
        }

        const checker = new Checker(program);

        // Register all of the rules for now.
        for (const rule of ENABLED_RULES) {
          new rule().register(checker);
        }

        result.push(
            ...checker.execute(program.getSourceFile(fileName)!)
                .map((failure) => {
                  // Show the diagnostic with stringigied fix (if there is any).
                  return failure.toDiagnosticWithStringifiedFix();
                }),
        );
        return result;
      };

      return proxy;
    }
  };
}

export = init;
